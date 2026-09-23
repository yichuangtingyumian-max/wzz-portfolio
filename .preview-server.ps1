$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add('http://127.0.0.1:4173/')
$root = (Get-Location).Path
$mime = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.svg'='image/svg+xml'; '.ttf'='font/ttf'; '.otf'='font/otf' }
$listener.Start()
try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
    $candidate = [IO.Path]::GetFullPath((Join-Path $root $relative))
    if (-not $candidate.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
      $context.Response.StatusCode = 404
      $context.Response.Close()
      continue
    }
    $bytes = [IO.File]::ReadAllBytes($candidate)
    $extension = [IO.Path]::GetExtension($candidate).ToLowerInvariant()
    $context.Response.ContentType = if ($mime.ContainsKey($extension)) { $mime[$extension] } else { 'application/octet-stream' }
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.Close()
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
