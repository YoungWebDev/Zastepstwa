<?php

namespace app\core;

class AutoLoader {

    public function __construct()
    {

        spl_autoload_register(array($this, "loader"));

    }

    private function loader($className)
    {

        $className = $this->refactorClassName($className);

        $file = __DIR__."/../../$className.php";

        require_once $file;

    }

    protected function refactorClassName($className)
    {
        return str_replace("\\", "/", $className);
    }
}
