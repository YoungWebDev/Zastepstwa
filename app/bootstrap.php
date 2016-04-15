<?php

namespace app;

use app\libs\AltoRouter;
use app\core\AutoLoader;

require_once __DIR__."/core/autoloader.php";

$autoloader = new AutoLoader();

$router = new AltoRouter();

require_once __DIR__."/routes.php";
