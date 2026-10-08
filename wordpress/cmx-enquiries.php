<?php
/**
 * ============================================================
 * Plugin Name: CodeXmattriX — Enquiries
 * Description: Stores pricing/package enquiries from the Next.js
 *              frontend as a WordPress post and emails the site
 *              owner. Powers the "Request This Package" flow on
 *              /pricing (no redirect to /contact).
 * Version:     1.2.0
 * Requires PHP: 7.4
 * Author:      CodeXmattriX
 * Text Domain: codexmattrix
 * ============================================================
 *
 * WHAT IT DOES
 *   1. Registers the private `cmx_enquiry` post type so every
 *      enquiry is visible in wp-admin → Enquiries.
 *   2. Exposes TWO REST routes, both authenticated by a shared secret
 *      header (X-CMX-Key) so the public cannot touch WordPress — only
 *      the Next.js server (app/api/enquiry/route.ts) can:
 *        POST /wp-json/cmx/v1/enquiry
 *          save a lead, then notify the owner via wp_mail().
 *        POST /wp-json/cmx/v1/enquiry/{id}/emailed
 *          called by Next.js AFTER its Resend/FormSubmit fallback
 *          delivered the alert, so the wp-admin "Emailed" column
 *          reflects the real delivery status instead of a stale "no".
 *   3. Emails the owner AFTER a successful save, so a mail failure
 *      can never lose a lead — it is already in the database.
 *
 *   4. Shows the FULL package breakdown (every selected service + the
 *      estimated total) on the enquiry's detail screen, and records the
 *      exact reason when an email could not be sent.
 *
 * INSTALL
 *   1. wp-admin → Plugins → Add New → Upload Plugin → choose this
 *      file → Install → Activate.  (Or drop it into
 *      public_html/wp-content/plugins/cmx-enquiries/ and activate.)
 *   2. Add the configuration to wp-config.php, ABOVE the
 *      "That's all, stop editing!" line:
 *        define( 'CMX_ENQUIRY_SECRET', '<64-char hex>' );
 *        define( 'CMX_ENQUIRY_EMAIL',  'you@example.com' );
 *      Generate a secret with:
 *        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *      It must match WORDPRESS_ENQUIRY_KEY in Next.js. It is deliberately
 *      NOT stored in this file so the secret never reaches your Git repo.
 *   3. Purge the Hostinger/LiteSpeed cache.
 * ============================================================
 */

// ------------------------------------------------------------------
// CONFIGURATION
//
// Set these in wp-config.php (NOT in this file) so the secret never
// lands in your public Git repo:
//
//   define( 'CMX_ENQUIRY_SECRET', '<64-char hex>' );
//   define( 'CMX_ENQUIRY_EMAIL',  'you@example.com' );
//   define( 'CMX_ENQUIRY_FROM',   'no-reply@yourdomain.com' ); // optional
//
// The secret must match WORDPRESS_ENQUIRY_KEY in Next.js. If it is left
// empty the REST route refuses every request instead of accepting
// unauthenticated submissions.
// ------------------------------------------------------------------
if ( ! defined( 'CMX_ENQUIRY_SECRET' ) ) {
	define( 'CMX_ENQUIRY_SECRET', (string) getenv( 'CMX_ENQUIRY_SECRET' ) );
}
if ( ! defined( 'CMX_ENQUIRY_EMAIL' ) ) {
	define( 'CMX_ENQUIRY_EMAIL', (string) getenv( 'CMX_ENQUIRY_EMAIL' ) );
}
if ( ! defined( 'CMX_ENQUIRY_FROM' ) ) {
	define( 'CMX_ENQUIRY_FROM', (string) getenv( 'CMX_ENQUIRY_FROM' ) );
}

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin notice when the plugin is active but not configured yet.
 */
add_action(
	'admin_notices',
	function () {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		if ( CMX_ENQUIRY_SECRET && CMX_ENQUIRY_EMAIL ) {
			return;
		}
		echo '<div class="notice notice-error"><p><strong>CodeXmattriX Enquiries:</strong> '
			. 'set <code>CMX_ENQUIRY_SECRET</code> and <code>CMX_ENQUIRY_EMAIL</code> '
			. 'in <code>wp-config.php</code>. Until then enquiries are saved but '
			. 'never emailed.</p></div>';
	}
);

/* ------------------------------------------------------------------
 * 1. Storage — the `cmx_enquiry` post type
 * ------------------------------------------------------------------ */
add_action(
	'init',
	function () {
		register_post_type(
			'cmx_enquiry',
			array(
				'labels'              => array(
					'name'          => __( 'Enquiries', 'codexmattrix' ),
					'singular_name' => __( 'Enquiry', 'codexmattrix' ),
					'menu_name'     => __( 'Enquiries', 'codexmattrix' ),
					'all_items'     => __( 'All enquiries', 'codexmattrix' ),
					'search_items'  => __( 'Search enquiries', 'codexmattrix' ),
					'not_found'     => __( 'No enquiries yet.', 'codexmattrix' ),
				),
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'menu_position'       => 26,
				'menu_icon'           => 'dashicons-email-alt',
				'capability_type'     => 'post',
				'map_meta_cap'        => true,
				'capabilities'        => array( 'create_posts' => 'do_not_allow' ),
				'supports'            => array( 'title' ),
				'has_archive'         => false,
				'exclude_from_search' => true,
				'rewrite'             => false,
				'query_var'           => false,
			)
		);
	}
);

/**
 * Columns in the wp-admin list table.
 */
add_filter(
	'manage_cmx_enquiry_posts_columns',
	function ( $columns ) {
		return array(
			'cb'         => isset( $columns['cb'] ) ? $columns['cb'] : '',
			'title'      => __( 'From', 'codexmattrix' ),
			'cmx_email'  => __( 'Email', 'codexmattrix' ),
			'cmx_phone'  => __( 'Phone', 'codexmattrix' ),
			'cmx_source' => __( 'Source', 'codexmattrix' ),
			'cmx_package' => __( 'Selected services', 'codexmattrix' ),
			'cmx_total'  => __( 'Estimate', 'codexmattrix' ),
			'cmx_mailed' => __( 'Emailed', 'codexmattrix' ),
			'date'       => __( 'Received', 'codexmattrix' ),
		);
	}
);

// NOTE: accepted_args MUST be 2. WordPress defaults it to 1, which left
// $post_id undefined and caused a PHP 8 fatal ("critical error") that
// broke the whole Enquiries list table.
add_action(
	'manage_cmx_enquiry_posts_custom_column',
	function ( $column, $post_id ) {
		// Defensive guard: a missing/zero ID would make get_post_meta()
		// throw a TypeError on PHP 8, which killed the entire list table.
		$post_id = (int) $post_id;
		if ( $post_id <= 0 ) {
			return;
		}

		$get = function ( $key ) use ( $post_id ) {
			$value = get_post_meta( $post_id, $key, true );
			return ( '' === $value || false === $value ) ? '' : $value;
		};

		switch ( $column ) {
			case 'cmx_package':
				$package = json_decode( $get( '_cmx_package' ), true );
				if ( ! is_array( $package ) || empty( $package ) ) {
					echo '<span style="color:#646970;">—</span>';
					break;
				}

				// Show every selected service inline, so the list alone
				// answers "what did this visitor pick?" without opening
				// the row. Hovering reveals the full set plus each price.
				$names = array();

				foreach ( $package as $item ) {
					if ( ! is_array( $item ) || empty( $item['service'] ) ) {
						continue;
					}
					$price   = (float) ( isset( $item['price'] ) ? $item['price'] : 0 );
					$names[] = sprintf( '%s ($%s)', $item['service'], number_format_i18n( $price, 0 ) );
				}

				if ( empty( $names ) ) {
					echo '<span style="color:#646970;">—</span>';
					break;
				}

				printf(
					'<span title="%1$s">%2$s</span>',
					esc_attr( implode( "\n", $names ) ),
					esc_html( implode( ' · ', $names ) )
				);
				break;

			case 'cmx_email':
				$email = $get( '_cmx_email' );
				if ( $email ) {
					printf( '<a href="mailto:%1$s">%1$s</a>', esc_attr( $email ) );
				}
				break;

			case 'cmx_phone':
				echo esc_html( $get( '_cmx_phone' ) );
				break;

			case 'cmx_source':
				$source = $get( '_cmx_source' );
				echo esc_html( $source ? ucfirst( $source ) : '—' );
				break;

			case 'cmx_total':
				$total = $get( '_cmx_total' );
				echo $total ? esc_html( 'USD ' . $total ) : '—';
				break;

			case 'cmx_mailed':
				$mailed = $get( '_cmx_mailed' );
				if ( 'yes' === $mailed ) {
					// Name the sender when it was the Next.js fallback
					// (Resend/FormSubmit) rather than wp_mail() itself.
					$via = $get( '_cmx_mailed_via' );
					echo ( '' !== $via )
						? '<span title="' . esc_attr(
							sprintf(
								/* translators: %s: provider that delivered the fallback mail */
								__( 'Delivered by %s — fallback after wp_mail failed', 'codexmattrix' ),
								$via
							)
						) . '">&#10003;</span>'
						: '&#10003;';
				} else {
					echo '<span style="color:#b32d2e" title="'
						. esc_attr( $get( '_cmx_mail_error' ) ) . '">no</span>';
				}
				break;
		}
	},
	10,
	2
);

// Newest enquiries first.
add_action(
	'pre_get_posts',
	function ( $query ) {
		if ( is_admin() && ! wp_doing_ajax() && $query->get( 'post_type' ) === 'cmx_enquiry' ) {
			$query->set( 'orderby', 'date' );
			$query->set( 'order', 'DESC' );
		}
	}
);

/* ------------------------------------------------------------------
 * 2. Input helpers — every value is sanitised on the way in
 * ------------------------------------------------------------------ */

/** Trim, strip tags/control chars, and clamp a plain-text field. */
function cmx_enquiry_text( $value, $max_length ) {
	if ( ! is_scalar( $value ) ) {
		return '';
	}
	// Tags are removed first, so no HTML can reach the DB or the email.
	$clean = sanitize_text_field( wp_unslash( (string) $value ) );
	return function_exists( 'mb_substr' ) ? mb_substr( $clean, 0, $max_length ) : substr( $clean, 0, $max_length );
}

/** Clamp an integer amount (the calculator total). */
function cmx_enquiry_amount( $value ) {
	$clean = sanitize_text_field( wp_unslash( (string) $value ) );
	return '' === $clean ? 0 : max( 0, (int) round( (float) $clean ) );
}

/** Strip a phone number down to safe characters. */
function cmx_enquiry_phone( $value ) {
	return preg_replace( '/[^0-9+()\- ]/', '', cmx_enquiry_text( $value, 40 ) );
}

/** Normalise the package list into a clean, priced array. */
function cmx_enquiry_package( $value ) {
	if ( ! is_array( $value ) || empty( $value ) ) {
		return array();
	}

	$items    = array();
	$position = 0;

	foreach ( $value as $entry ) {
		if ( ! is_array( $entry ) ) {
			continue;
		}

		$label = cmx_enquiry_text( isset( $entry['service'] ) ? $entry['service'] : '', 160 );
		if ( '' === $label ) {
			continue;
		}

		$items[] = array(
			'service' => $label,
			'price'   => cmx_enquiry_amount( isset( $entry['price'] ) ? $entry['price'] : 0 ),
		);

		// Hard cap so a malformed request can never bloat the row.
		if ( ++$position >= 40 ) {
			break;
		}
	}

	return $items;
}

/* ------------------------------------------------------------------
 * 3. Notification email
 * ------------------------------------------------------------------ */

/** Escape a value for the HTML body. */
function cmx_enquiry_e( $value ) {
	return esc_html( (string) $value );
}

/** Build the HTML notification body. */
function cmx_enquiry_email_body( $data ) {
	$rows     = '';
	$has_rows = false;
	$total    = 0;

	foreach ( $data['package'] as $item ) {
		$price = (float) $item['price'];
		$total += $price;
		$rows .= '<tr>'
			. '<td style="padding:8px 0;border-bottom:1px solid #e9e7e2;">'
			. cmx_enquiry_e( $item['service'] ) . '</td>'
			. '<td style="padding:8px 0;border-bottom:1px solid #e9e7e2;'
			. 'text-align:right;font-weight:700;">$'
			. cmx_enquiry_e( number_format_i18n( $price, 0 ) ) . '</td>'
			. '</tr>';
		$has_rows = true;
	}

	$package_block = '';
	if ( $has_rows ) {
		$package_block = '<h2 style="margin:24px 0 8px;font-size:15px;color:#14181d;">'
			. 'Requested package</h2>'
			. '<table style="width:100%;border-collapse:collapse;font-size:14px;">'
			. $rows
			. '<tr><td style="padding:10px 0;font-weight:700;">Estimated total</td>'
			. '<td style="padding:10px 0;text-align:right;font-weight:700;color:#e63329;">$'
			. cmx_enquiry_e( number_format_i18n( $total, 0 ) )
			. '</td></tr></table>';
	}

	$message_block = '';
	if ( '' !== $data['message'] ) {
		$message_block = '<h2 style="margin:24px 0 8px;font-size:15px;color:#14181d;">'
			. 'Message</h2>'
			. '<div style="font-size:14px;line-height:1.6;color:#5b6570;">'
			. nl2br( cmx_enquiry_e( $data['message'] ) )
			. '</div>';
	}

	$details = '';
	foreach ( array(
		'Name'      => $data['name'],
		'Email'     => $data['email'],
		'Phone'     => '' !== $data['phone'] ? $data['phone'] : '—',
		'Company'   => '' !== $data['company'] ? $data['company'] : '—',
		'Source'    => ucfirst( $data['source'] ),
		'Page'      => $data['page'],
		'Submitted' => $data['submitted'],
	) as $label => $value ) {
		$details .= '<tr>'
			. '<td style="padding:6px 16px 6px 0;color:#9aa3ac;font-size:13px;'
			. 'white-space:nowrap;vertical-align:top;">' . cmx_enquiry_e( $label ) . '</td>'
			. '<td style="padding:6px 0;color:#14181d;font-size:14px;">'
			. cmx_enquiry_e( $value ) . '</td>'
			. '</tr>';
	}

	$body  = '<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;">';
	$body .= '<h1 style="margin:0 0 4px;font-size:20px;color:#14181d;">New package enquiry</h1>';
	$body .= '<p style="margin:0 0 20px;color:#9aa3ac;font-size:13px;">'
		. 'Sent from the CodeXmattriX pricing calculator.</p>';
	$body .= '<table style="width:100%;border-collapse:collapse;">' . $details . '</table>';
	$body .= $package_block;
	$body .= $message_block;
	$body .= '<p style="margin:28px 0 0;color:#9aa3ac;font-size:12px;">'
		. 'Reply directly to this email to answer the customer.</p>';
	$body .= '</div>';

	return $body;
}

/* ------------------------------------------------------------------
 * 3b. Detail view — the full breakdown of one enquiry
 *
 * The list table can only show one line. This panel shows EVERY
 * selected service with its price, the running total, and the raw
 * answers, so nothing a visitor chose is hidden.
 * ------------------------------------------------------------------ */
add_action(
	'add_meta_boxes',
	function () {
		add_meta_box(
			'cmx_enquiry_detail',
			__( 'Requested package', 'codexmattrix' ),
			'cmx_enquiry_render_detail',
			'cmx_enquiry',
			'normal',
			'high'
		);
	}
);

function cmx_enquiry_render_detail( $post ) {
	$get = function ( $key ) use ( $post ) {
		$value = get_post_meta( $post->ID, $key, true );
		return ( '' === $value || false === $value ) ? '' : $value;
	};

	$package = json_decode( $get( '_cmx_package' ), true );
	if ( ! is_array( $package ) ) {
		$package = array();
	}

	$total = 0;
	$rows  = '';

	foreach ( $package as $item ) {
		if ( ! is_array( $item ) || empty( $item['service'] ) ) {
			continue;
		}
		$price = (float) ( isset( $item['price'] ) ? $item['price'] : 0 );
		$total += $price;

		$rows .= '<tr>'
			. '<td style="padding:10px 12px;border-bottom:1px solid #e9e7e2;">'
			. esc_html( $item['service'] ) . '</td>'
			. '<td style="padding:10px 12px;border-bottom:1px solid #e9e7e2;'
			. 'text-align:right;font-weight:600;white-space:nowrap;">$'
			. esc_html( number_format_i18n( $price, 0 ) ) . '</td>'
			. '</tr>';
	}

	echo '<div style="font-family:system-ui,-apple-system,sans-serif;">';

	// --- Contact block.
	$fields = array(
		__( 'Name', 'codexmattrix' )      => $get( '_cmx_name' ),
		__( 'Email', 'codexmattrix' )     => $get( '_cmx_email' ),
		__( 'Phone', 'codexmattrix' )     => $get( '_cmx_phone' ),
		__( 'Company', 'codexmattrix' )   => $get( '_cmx_company' ),
		__( 'Source', 'codexmattrix' )    => $get( '_cmx_source' ),
		__( 'Submitted', 'codexmattrix' ) => $get( '_cmx_submitted' ),
	);

	echo '<table style="width:100%;border-collapse:collapse;margin-bottom:18px;">';
	foreach ( $fields as $label => $value ) {
		if ( '' === $value ) {
			continue;
		}
		echo '<tr>'
			. '<td style="padding:6px 14px 6px 0;color:#646970;width:130px;'
			. 'vertical-align:top;">' . esc_html( $label ) . '</td>'
			. '<td style="padding:6px 0;">';
		if ( __( 'Email', 'codexmattrix' ) === $label ) {
			echo '<a href="mailto:' . esc_attr( $value ) . '"><strong>'
				. esc_html( $value ) . '</strong></a>';
		} else {
			echo esc_html( $value );
		}
		echo '</td></tr>';
	}
	echo '</table>';

	// --- Package table.
	if ( $rows ) {
		echo '<h3 style="margin:0 0 8px;font-size:14px;">'
			. esc_html__( 'Selected services', 'codexmattrix' ) . '</h3>';
		echo '<table style="width:100%;border-collapse:collapse;'
			. 'border:1px solid #e9e7e2;border-radius:6px;overflow:hidden;">';
		echo '<tr style="background:#f6f5f3;">'
			. '<th style="padding:8px 12px;text-align:left;font-size:12px;'
			. 'text-transform:uppercase;letter-spacing:.06em;color:#646970;">'
			. esc_html__( 'Service', 'codexmattrix' ) . '</th>'
			. '<th style="padding:8px 12px;text-align:right;font-size:12px;'
			. 'text-transform:uppercase;letter-spacing:.06em;color:#646970;">'
			. esc_html__( 'Price', 'codexmattrix' ) . '</th>'
			. '</tr>';
		echo $rows; // phpcs:ignore WordPress.Security.EscapeOutput -- built with esc_html above.
		echo '<tr style="background:#f6f5f3;font-weight:700;">'
			. '<td style="padding:10px 12px;">'
			. esc_html__( 'Estimated total', 'codexmattrix' ) . '</td>'
			. '<td style="padding:10px 12px;text-align:right;color:#e63329;">$'
			. esc_html( number_format_i18n( $total, 0 ) ) . '</td>'
			. '</tr>';
		echo '</table>';
	} else {
		echo '<p style="color:#646970;">'
			. esc_html__( 'No package lines were attached to this enquiry.', 'codexmattrix' )
			. '</p>';
	}

	// --- The visitor's message.
	if ( '' !== $get( '_cmx_message' ) ) {
		echo '<h3 style="margin:20px 0 8px;font-size:14px;">'
			. esc_html__( 'Message', 'codexmattrix' ) . '</h3>';
		echo '<div style="padding:12px;background:#f6f5f3;border-radius:6px;'
			. 'white-space:pre-wrap;">' . esc_html( $get( '_cmx_message' ) ) . '</div>';
	}

	// --- Mail status + the exact failure reason, if any.
	$mailed = $get( '_cmx_mailed' );
	echo '<p style="margin-top:18px;font-size:13px;">'
		. '<strong>' . esc_html__( 'Email:', 'codexmattrix' ) . '</strong> ';
	if ( 'yes' === $mailed ) {
		echo '<span style="color:#007017;">'
			. esc_html__( 'sent ✓', 'codexmattrix' ) . '</span>';
		$via = $get( '_cmx_mailed_via' );
		if ( '' !== $via ) {
			echo ' <span style="color:#646970;font-size:12px;">'
				. esc_html(
					sprintf(
						/* translators: %s: provider that delivered the fallback mail */
						__( 'via %s (fallback after wp_mail failed)', 'codexmattrix' ),
						$via
					)
				) . '</span>';
		}
	} else {
		echo '<span style="color:#b32d2e;">'
			. esc_html__( 'NOT sent', 'codexmattrix' ) . '</span>';
		$reason = $get( '_cmx_mail_error' );
		if ( '' !== $reason ) {
			echo '<br><code style="font-size:12px;color:#646970;">'
				. esc_html( $reason ) . '</code>';
		}
	}
	echo ' &rarr; ' . esc_html( CMX_ENQUIRY_EMAIL ) . '</p>';

	echo '</div>';
}

/* ------------------------------------------------------------------
 * 4. REST route — POST /wp-json/cmx/v1/enquiry
 * ------------------------------------------------------------------ */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'cmx/v1',
			'/enquiry',
			array(
				'methods'             => 'POST',
				'callback'            => 'cmx_enquiry_post',
				// The secret is verified inside the callback so we can
				// return a clear 403 instead of a generic "rest_forbidden".
				'permission_callback' => '__return_true',
			)
		);

		// Fallback-delivery report: the Next.js server calls this AFTER
		// Resend/FormSubmit accepted the alert. WordPress only knows its
		// own wp_mail() result, so without this call the "Emailed"
		// column would stay on "no" even when the mail went out.
		register_rest_route(
			'cmx/v1',
			'/enquiry/(?P<id>\d+)/emailed',
			array(
				'methods'             => 'POST',
				'callback'            => 'cmx_enquiry_mark_mailed',
				'permission_callback' => '__return_true',
			)
		);
	}
);

/**
 * Shared-secret check used by every cmx/v1 route.
 *
 * Returns `null` when the caller may proceed, or a WP_Error (500/403)
 * describing why not. Kept in one place so the create route and the
 * "emailed" update route can never drift apart.
 */
function cmx_enquiry_auth( $request ) {
	// hash_equals() throws a TypeError when the secret is not a string, so
	// an unconfigured (empty) plugin must refuse BEFORE it gets there.
	if ( '' === CMX_ENQUIRY_SECRET ) {
		return new WP_Error(
			'cmx_not_configured',
			__( 'CMX_ENQUIRY_SECRET is not set in wp-config.php.', 'codexmattrix' ),
			array( 'status' => 500 )
		);
	}

	$secret = $request->get_header( 'x-cmx-key' );
	if ( ! is_string( $secret ) || '' === $secret ) {
		return new WP_Error(
			'cmx_forbidden',
			__( 'Missing enquiry key.', 'codexmattrix' ),
			array( 'status' => 403 )
		);
	}
	if ( ! hash_equals( CMX_ENQUIRY_SECRET, $secret ) ) {
		return new WP_Error(
			'cmx_forbidden',
			__( 'Invalid enquiry key.', 'codexmattrix' ),
			array( 'status' => 403 )
		);
	}

	return null;
}

/**
 * Create an enquiry: save it, then notify the owner.
 */
function cmx_enquiry_post( WP_REST_Request $request ) {
	// --- 1. Authenticate the caller (the Next.js server, not a browser).
	$auth = cmx_enquiry_auth( $request );
	if ( is_wp_error( $auth ) ) {
		return $auth;
	}

	// --- 2. Collect + sanitise.
	$data = array(
		'name'      => cmx_enquiry_text( $request->get_param( 'name' ), 120 ),
		'email'     => cmx_enquiry_text( $request->get_param( 'email' ), 190 ),
		'phone'     => cmx_enquiry_phone( $request->get_param( 'phone' ) ),
		'company'   => cmx_enquiry_text( $request->get_param( 'company' ), 160 ),
		'message'   => cmx_enquiry_text( $request->get_param( 'message' ), 4000 ),
		'source'    => cmx_enquiry_text( $request->get_param( 'source' ), 40 ),
		'page'      => cmx_enquiry_text( $request->get_param( 'page' ), 300 ),
		'submitted' => gmdate( 'Y-m-d H:i:s' ) . ' UTC',
		'package'   => cmx_enquiry_package( $request->get_param( 'package' ) ),
	);

	if ( '' === $data['source'] ) {
		$data['source'] = 'website';
	}

	// --- 3. Validate the essentials.
	$missing = array();
	if ( '' === $data['name'] ) {
		$missing[] = 'name';
	}
	if ( '' === $data['email'] || ! is_email( $data['email'] ) ) {
		$missing[] = 'email';
	}
	if ( $missing ) {
		return new WP_Error(
			'cmx_invalid',
			sprintf(
				/* translators: %s: comma-separated field names */
				__( 'Missing or invalid: %s', 'codexmattrix' ),
				implode( ', ', $missing )
			),
			array( 'status' => 400 )
		);
	}

	$total = (int) array_sum( wp_list_pluck( $data['package'], 'price' ) );

	// --- 4. SAVE FIRST — a mail failure must never lose the lead.
	$summary = $data['name'];
	if ( '' !== $data['company'] ) {
		$summary .= ' — ' . $data['company'];
	}
	if ( $total > 0 ) {
		$summary .= sprintf( ' ($%d)', $total );
	}

	$post_id = wp_insert_post(
		array(
			'post_type'    => 'cmx_enquiry',
			'post_status'  => 'publish',
			'post_title'   => wp_strip_all_tags( $summary ),
			'post_content' => $data['message'],
		),
		true
	);

	if ( is_wp_error( $post_id ) ) {
		return new WP_Error(
			'cmx_save_failed',
			__( 'Could not save the enquiry.', 'codexmattrix' ),
			array( 'status' => 500 )
		);
	}

	foreach ( array(
		'_cmx_name'      => $data['name'],
		'_cmx_email'     => $data['email'],
		'_cmx_phone'     => $data['phone'],
		'_cmx_company'   => $data['company'],
		'_cmx_message'   => $data['message'],
		'_cmx_source'    => $data['source'],
		'_cmx_page'      => $data['page'],
		'_cmx_total'     => (string) $total,
		'_cmx_package'   => wp_json_encode( $data['package'] ),
		'_cmx_submitted' => $data['submitted'],
	) as $key => $value ) {
		update_post_meta( $post_id, $key, $value );
	}

	// --- 5. Notify (best effort — the lead is already stored).
	// ---- Host-mail compatibility -------------------------------
	// Shared hosts (Hostinger included) refuse a From address whose domain
	// does not match the account's own mail domain, and PHP's mail() often
	// needs a 5th "-f" parameter there. Falling back to the WordPress admin
	// address keeps delivery working instead of silently failing.
	$from = ( '' !== CMX_ENQUIRY_FROM ) ? CMX_ENQUIRY_FROM : (string) get_option( 'admin_email' );
	if ( ! is_email( $from ) ) {
		$from = $data['email']; // last resort — keeps wp_email intact.
	}

	$headers = array(
		'Content-Type: text/html; charset=UTF-8',
		sprintf( 'From: %s <%s>', get_bloginfo( 'name' ), $from ),
	);

	// Reply-To = the customer, so "Reply" in the inbox reaches them.
	if ( is_email( $data['email'] ) ) {
		$headers[] = sprintf( 'Reply-To: %s <%s>', $data['name'], $data['email'] );
	}

	// The 5th wp_mail() argument is only valid when the host runs a local
	// sendmail; on hosts that do not, passing it makes mail() fail outright.
	$params = ( ini_get( 'sendmail_path' ) ) ? array( '-f' . $from ) : array();

	// Capture WHY wp_mail failed, so the admin can see it in the "Emailed"
	// column tooltip instead of guessing. Runs for this request only.
	$mail_error = '';
	$capture    = function ( $error ) use ( &$mail_error ) {
		$wp_error = $error instanceof WP_Error ? $error->get_error_message() : '';
		$mail_error = $wp_error ? $wp_error : 'wp_mail() returned false (host refused to send)';
	};
	add_action( 'wp_mail_failed', $capture, 10, 1 );

	$subject = sprintf(
		/* translators: 1: customer name, 2: estimated total in brackets */
		__( 'New pricing enquiry from %1$s%2$s', 'codexmattrix' ),
		$data['name'],
		$total > 0 ? sprintf( ' ($%d)', $total ) : ''
	);

	$sent = wp_mail(
		CMX_ENQUIRY_EMAIL,
		$subject,
		cmx_enquiry_email_body( $data ),
		$headers,
		$params
	);

	remove_action( 'wp_mail_failed', $capture, 10 );

	update_post_meta( $post_id, '_cmx_mailed', $sent ? 'yes' : 'no' );
	update_post_meta( $post_id, '_cmx_mail_error', $sent ? '' : $mail_error );

	// Log the reason server-side too — the only reliable way to debug a
	// host mail failure from wp-admin without shell access.
	if ( ! $sent ) {
		error_log(
			sprintf(
				'[CMX enquiry] wp_mail failed for enquiry #%d (%s) from=%s sendmail=%s: %s',
				$post_id,
				$data['email'],
				$from,
				(string) ini_get( 'sendmail_path' ),
				$mail_error ? $mail_error : 'unknown reason'
			)
		);
	}

	return new WP_REST_Response(
		array(
			'ok'      => true,
			'id'      => $post_id,
			'emailed' => (bool) $sent,
		),
		201
	);
}

/**
 * Mark an enquiry as emailed after a Next.js fallback send succeeded.
 *
 * WordPress can only observe its own wp_mail() result, so when the
 * alert was delivered by Resend/FormSubmit (app/lib/enquiry-mail.ts)
 * the "Emailed" column would keep showing "no". The Next.js server
 * calls this route with the created post id to correct the record.
 *
 * Idempotent — repeating the same update is harmless.
 */
function cmx_enquiry_mark_mailed( WP_REST_Request $request ) {
	$auth = cmx_enquiry_auth( $request );
	if ( is_wp_error( $auth ) ) {
		return $auth;
	}

	$post_id = (int) $request->get_param( 'id' );
	if ( $post_id <= 0 || 'cmx_enquiry' !== get_post_type( $post_id ) ) {
		return new WP_Error(
			'cmx_not_found',
			__( 'No such enquiry.', 'codexmattrix' ),
			array( 'status' => 404 )
		);
	}

	// Who actually delivered it — "resend" or "formsubmit".
	$via = cmx_enquiry_text( $request->get_param( 'via' ), 40 );
	if ( '' === $via ) {
		$via = 'fallback';
	}

	update_post_meta( $post_id, '_cmx_mailed', 'yes' );
	update_post_meta( $post_id, '_cmx_mail_error', '' );
	update_post_meta( $post_id, '_cmx_mailed_via', $via );

	return new WP_REST_Response(
		array(
			'ok'  => true,
			'id'  => $post_id,
			'via' => $via,
		),
		200
	);
}



