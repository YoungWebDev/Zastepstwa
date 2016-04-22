<?php

$router->map('GET', '/status/[a:date]', function($date) {
    $scraper = new app\core\Scraper();
    echo $scraper->status($date);
});

$router->map('GET', '/scrape/[a:date]/[a:classID]', function($date, $classID) {
    $scraper = new app\core\Scraper();
    echo $scraper->scrape($date, $classID);
});
