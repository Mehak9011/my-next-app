<?php
/**
 * ============================================================
 * CodeXmattriX — Full-headless front-end proxy (chosen wiring)
 * ============================================================
 * Renders the WordPress-domain public URLs (cms.codexmattrix.com/*)
 * with the EXACT Next.js pages served from Vercel — WITHOUT
 * Cloudflare, WITHOUT Apache mod_proxy, WITHOUT any
 * DNS/nameserver change.
 *
 * HOW IT WORKS
 *   The .htaccess (see htaccess-frontend-proxy.txt) routes every
 *   public request to this script. The script fetches the SAME
 *   path from the Next.js origin and streams the response back,
 *   so the browser keeps the cms.codexmattrix.com/... URL and the
 *   design + content are 100% the Next.js build.
 *
 *   Assets (/ _next/static, /images, /icon.svg …) flow through the
 *   same rule, so the whole site works from the CMS domain.
 *
 * WHAT STAYS ON WORDPRESS (never proxied)
 *   /wp-admin, /wp-login.php, /wp-json, /graphql, /wp-content,
 *   /wp-includes, /wp-cron.php, /xmlrpc.php, /.well-known/,
 *   proxy.php — the editor, media library, and the WPGraphQL API
 *   (which the Next.js registry queries) keep working untouched.
 *
 * INSTALL (Hostinger hPanel)
 *   1. File Manager → public_html →
 *      upload this file as  proxy.php
 *   2. Open  .htaccess  (create it if missing) and replace its
 *      WHOLE content with Variant 1 of wordpress/htaccess-frontend-proxy.txt
 *   3. Open https://cms.codexmattrix.com/about/  → you should see
 *      the Next.js About page with the CMS URL in the address bar.
 * ============================================================
 */

// ------------------------------------------------------------------
// CHANGE THIS if your Vercel project URL is different.
// ------------------------------------------------------------------
$CMX_NEXT_ORIGIN = 'https://my-next-app-phi-flax.vercel.app';

// Only the .htaccess rewrite may use this proxy (blocks open-proxy abuse).
if ( ( $_GET['_cmx'] ?? '' ) !== '1' ) {
	http_response_code( 404 );
	exit;
}

$request_uri  = $_SERVER['REQUEST_URI'] ?? '/';
$parts        = explode( '?', $request_uri, 2 );
$path         = $parts[0];
$query        = $parts[1] ?? '';
$clean_query  = array();

// Drop the internal _cmx flag before forwarding.
if ( '' !== $query ) {
	foreach ( explode( '&', $query ) as $pair ) {
		if ( strncmp( $pair, '_cmx=', 5 ) !== 0 ) {
			$clean_query[] = $pair;
		}
	}
}

$target = rtrim( $CMX_NEXT_ORIGIN, '/' ) . $path;
if ( count( $clean_query ) > 0 ) {
	$target .= '?' . implode( '&', $clean_query );
}

$ch = curl_init( $target );
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, true );
curl_setopt( $ch, CURLOPT_MAXREDIRS, 5 );
curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 10 );
curl_setopt( $ch, CURLOPT_TIMEOUT, 30 );
curl_setopt( $ch, CURLOPT_ENCODING, '' );          // allow gzip, auto-decode
curl_setopt( $ch, CURLOPT_HEADER, true );          // capture upstream headers
curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, true );
curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 2 );

$method       = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$curl_headers = array();

if ( ( $_SERVER['HTTP_USER_AGENT'] ?? '' ) !== '' ) {
	$curl_headers[] = 'User-Agent: ' . $_SERVER['HTTP_USER_AGENT'];
}
if ( ( $_SERVER['HTTP_ACCEPT'] ?? '' ) !== '' ) {
	$curl_headers[] = 'Accept: ' . $_SERVER['HTTP_ACCEPT'];
}

if ( 'POST' === $method ) {
	curl_setopt( $ch, CURLOPT_POST, true );
	curl_setopt( $ch, CURLOPT_POSTFIELDS, file_get_contents( 'php://input' ) );
	if ( ( $_SERVER['CONTENT_TYPE'] ?? '' ) !== '' ) {
		$curl_headers[] = 'Content-Type: ' . $_SERVER['CONTENT_TYPE'];
	}
} elseif ( 'GET' !== $method && 'HEAD' !== $method ) {
	curl_setopt( $ch, CURLOPT_CUSTOMREQUEST, $method );
}

if ( count( $curl_headers ) > 0 ) {
	curl_setopt( $ch, CURLOPT_HTTPHEADER, $curl_headers );
}

$response = curl_exec( $ch );

if ( $response === false ) {
	$error = curl_error( $ch );
	curl_close( $ch );
	header( 'Content-Type: text/plain; charset=utf-8' );
	http_response_code( 502 );
	echo "CodeXmattriX proxy: the Next.js origin is unreachable.\n" . $error . "\n";
	exit;
}

$status = curl_getinfo( $ch, CURLINFO_RESPONSE_CODE );
curl_close( $ch );

if ( 0 === $status ) {
	$status = 502;
}

// Split the response into header block + body.
$header_end = strpos( $response, "\r\n\r\n" );
$body       = $response;

if ( $header_end !== false ) {
	$body        = substr( $response, $header_end + 4 );
	$header_blk  = substr( $response, 0, $header_end );

	// Forward a safe subset of upstream headers.
	foreach ( explode( "\n", $header_blk ) as $raw_line ) {
		$line = rtrim( $raw_line, "\r" );
		$low  = strtolower( $line );

		if ( strncmp( $low, 'content-type:', 13 ) === 0
			|| strncmp( $low, 'cache-control:', 14 ) === 0 ) {
			header( $line, true );
		}
	}
}

header( 'X-CMX-Proxy', 'codexmattrix-php-front-proxy', false );
http_response_code( $status );
echo $body;

exit;