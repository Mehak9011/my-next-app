<?php
/**
 * ============================================================
 * CodeXmattriX — Full-headless front-end proxy (chosen wiring)
 * ============================================================
 * v3 — homepage fix + header-safe:
 *   • CURLOPT_HEADER OFF + HEADERFUNCTION (HTTP/2 + gzip safe).
 *     v1 proxy leaked "HTTP/2 200 ..." text into /about/, /contact/
 *     because it split combined redirect headers on the FIRST blank
 *     line. v2/v3 never mix headers into the body.
 *   • FOLLOWLOCATION OFF — Vercel 308 (/about/ → /about) is re-emitted
 *     with Location rewritten to the CMS host, browser follows on CMS.
 *   • "/" (homepage) is proxied to Next.js "/" (app/page.tsx) like any
 *     other path. If "/" still shows the WordPress theme ("Cms / Home"
 *     + logo only), the site-root .htaccess was NOT replaced yet or the
 *     Hostinger/LiteSpeed cache was not purged — see Variant 1 in
 *     wordpress/htaccess-frontend-proxy.txt + step 5 of
 *     wordpress/README-wordpress-setup.md.
 * INSTALL (Hostinger hPanel)
 *   1. File Manager → public_html →
 *      upload this file as  proxy.php  (overwrite the old v1 file)
 *   2. Open  .htaccess  (create it if missing) and replace its
 *      WHOLE content with Variant 1 of wordpress/htaccess-frontend-proxy.txt
 *      (it contains an explicit "^$" rule for the homepage)
 *   3. Purge cache (Hostinger → Cache → Purge All / LiteSpeed plugin)
 *   4. Open https://cms.codexmattrix.com/  → Next.js Home must render.
 *      Open https://cms.codexmattrix.com/about/ → clean Next.js About
 *      (no "HTTP/2 200 ..." text at the top).
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

$scheme      = ( ! empty( $_SERVER['HTTPS'] ) && $_SERVER['HTTPS'] !== 'off' ) ? 'https' : 'http';
$current_host = $_SERVER['HTTP_HOST'] ?? 'cms.codexmattrix.com';
$next_host    = parse_url( $CMX_NEXT_ORIGIN, PHP_URL_HOST );

$request_uri  = $_SERVER['REQUEST_URI'] ?? '/';
$parts        = explode( '?', $request_uri, 2 );
$path         = $parts[0];
$query        = $parts[1] ?? '';
$clean_query  = array();

// Drop the internal _cmx flag before forwarding.
if ( '' !== $query ) {
	foreach ( explode( '&', $query ) as $pair ) {
		if ( '' === $pair ) {
			continue;
		}
		if ( strncmp( $pair, '_cmx=', 5 ) === 0 ) {
			continue;
		}
		// Internal test helper (see below) — never forward to Vercel.
		if ( strncmp( $pair, 'cmx_path=', 9 ) === 0 ) {
			continue;
		}
		$clean_query[] = $pair;
	}
}

$target = rtrim( $CMX_NEXT_ORIGIN, '/' ) . ( '' !== $path ? $path : '/' );

// Direct-hit test helper: opening /proxy.php?_cmx=1&cmx_path=/about/ in the
// browser proves the proxy + Vercel origin work even when the .htaccess
// rewrite has not been installed yet. Without this, a direct hit would ask
// Vercel for "/proxy.php" (404) instead of the page you want to preview.
// NOTE: "/" (homepage) is proxied like any other path — $path "/" targets
// the Next.js "/" (app/page.tsx). If "/" still shows the WordPress theme,
// the site-root .htaccess was NOT replaced / Hostinger cache was not purged
// (see wordpress/htaccess-frontend-proxy.txt Variant 1 + README).
if ( '/proxy.php' === $path ) {
	$test_path = '/' . ltrim( ( $_GET['cmx_path'] ?? '/' ), '/' );
	$target    = rtrim( $CMX_NEXT_ORIGIN, '/' ) . $test_path;
}
if ( count( $clean_query ) > 0 ) {
	$target .= '?' . implode( '&', $clean_query );
}

$ch = curl_init( $target );
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
// FOLLOWLOCATION OFF (redirects re-emitted manually) + HEADER OFF
// (headers captured via HEADERFUNCTION — safe for HTTP/2 + gzip).
curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, false );
curl_setopt( $ch, CURLOPT_MAXREDIRS, 0 );
curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 10 );
curl_setopt( $ch, CURLOPT_TIMEOUT, 30 );
curl_setopt( $ch, CURLOPT_ENCODING, '' ); // accept gzip/br, curl decodes body
curl_setopt( $ch, CURLOPT_HEADER, false ); // NEVER mix headers into the body
curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, true );
curl_setopt( $ch, CURLOPT_SSL_VERIFYHOST, 2 );

// Capture upstream headers line-by-line (safe for HTTP/1.1 + HTTP/2).
$upstream_headers = array();
curl_setopt(
	$ch,
	CURLOPT_HEADERFUNCTION,
	function ( $curl, $header_line ) use ( &$upstream_headers ) {
		$len     = strlen( $header_line );
		$trimmed = trim( $header_line );
		if ( '' !== $trimmed && strpos( $trimmed, ':' ) !== false ) {
			list( $name, $value ) = explode( ':', $trimmed, 2 );
			$upstream_headers[ strtolower( trim( $name ) ) ][] = trim( $value );
		}
		return $len;
	}
);

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

$body = curl_exec( $ch );

if ( $body === false ) {
	$error = curl_error( $ch );
	curl_close( $ch );
	header( 'Content-Type: text/plain; charset=utf-8' );
	http_response_code( 502 );
	echo "CodeXmattriX proxy: the Next.js origin is unreachable.\n" . $error . "\n";
	exit;
}

$status       = (int) curl_getinfo( $ch, CURLINFO_RESPONSE_CODE );
$content_type = curl_getinfo( $ch, CURLINFO_CONTENT_TYPE );
curl_close( $ch );

if ( 0 === $status ) {
	$status = 502;
}

// Content-Type comes from curl_getinfo (already decoded body, no splitting).
if ( is_string( $content_type ) && '' !== $content_type ) {
	header( 'Content-Type: ' . $content_type );
}
if ( isset( $upstream_headers['cache-control'][0] ) ) {
	header( 'Cache-Control: ' . $upstream_headers['cache-control'][0] );
}

// Rewrite Location so redirects keep the CMS host in the address bar.
if ( isset( $upstream_headers['location'][0] ) ) {
	$raw_loc    = $upstream_headers['location'][0];
	$loc_scheme = parse_url( $raw_loc, PHP_URL_SCHEME );
	$loc_host   = parse_url( $raw_loc, PHP_URL_HOST );
	if ( null === $loc_scheme && null === $loc_host ) {
		header( 'Location: ' . $scheme . '://' . $current_host . $raw_loc, true );
	} elseif ( $next_host && $loc_host === $next_host ) {
		$rebuilt = $scheme . '://' . $current_host
			. ( parse_url( $raw_loc, PHP_URL_PATH ) ?? '/' );
		$rl_q = parse_url( $raw_loc, PHP_URL_QUERY );
		$rl_f = parse_url( $raw_loc, PHP_URL_FRAGMENT );
		if ( $rl_q ) {
			$rebuilt .= '?' . $rl_q;
		}
		if ( $rl_f ) {
			$rebuilt .= '#' . $rl_f;
		}
		header( 'Location: ' . $rebuilt, true );
	} else {
		header( 'Location: ' . $raw_loc, true );
	}
}

header( 'X-CMX-Proxy', 'codexmattrix-php-front-proxy v3', false );
http_response_code( $status );

// Redirects carry no body — stop here so no stray bytes are printed.
if ( $status >= 300 && $status < 400 ) {
	exit;
}

echo $body;

exit;