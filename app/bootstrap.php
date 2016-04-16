<?php

namespace app;

use app\libs\AltoRouter;
use app\core\AutoLoader;
use app\core\Scraper;

require_once __DIR__."/core/autoloader.php";

$autoloader = new AutoLoader();

$router = new AltoRouter();

$router->setBasePath("/Projekty/Zastepstwa/public");

require_once __DIR__."/routes.php";

$match = $router->match();

if (!$match)
{
    echo "<h2>ERROR 404 - PAGE NOT FOUND</h2>";
} else {
    call_user_func_array( $match['target'], $match['params'] );
}
