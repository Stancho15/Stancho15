# Previews the site at http://localhost:4173 (only visible on this computer).
# Run it from the website folder:  powershell -ExecutionPolicy Bypass -File serve.ps1
# Stop it with Ctrl+C.

$root = (Resolve-Path $PSScriptRoot).Path
$listener = New-Object System.Net.HttpListener
$port = if ($env:PORT) { $env:PORT } else { 4173 }
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Portfolio running at http://localhost:$port"

$types = @{
  ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"
  ".json" = "application/json"; ".svg" = "image/svg+xml"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"
  ".png" = "image/png"; ".webp" = "image/webp"
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart("/")
    if (-not $rel) { $rel = "index.html" }
    $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if ($path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $path -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($path)
      $type = $types[[IO.Path]::GetExtension($path).ToLower()]
      if ($type) { $ctx.Response.ContentType = $type }
      $ctx.Response.Headers.Add("Cache-Control", "no-store")
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
  } catch {
    $ctx.Response.StatusCode = 500
  } finally {
    $ctx.Response.Close()
  }
}
