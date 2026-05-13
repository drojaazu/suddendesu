<?php
  // And now, your moment of zen...
  $files = glob('*.*');
  $rndfile = $files[array_rand($files)];
  $fhandle = fopen($rndfile, "rb");

  $content_type = "Content-Type: Unknown";

  switch(strtolower(substr($rndfile,strpos($rndfile,'.')+1,3))) {
    case "png":
      $content_type = "Content-Type: image/png";
      break;
    case "jpg":
      $content_type = "Content-Type: image/jpeg";
      break;
    case "gif":
      $content_type = "Content-Type: image/gif";
      break;
  }

  header($content_type);
  header("Content-Length: " . filesize($rndfile));

  fpassthru($fhandle);
  exit;
?>
