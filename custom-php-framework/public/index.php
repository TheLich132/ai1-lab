<?php

use App\Controller\InfoController;
use App\Controller\PostController;
use App\Controller\BookController;
use App\Service\Config;
use App\Service\Router;
use App\Service\Templating;

require_once __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'autoload.php';

$config = new Config();

$templating = new Templating();
$router = new Router();

$action = $_REQUEST['action'] ?? null;
switch ($action) {
    case 'post-index':
    case null:
        $controller = new PostController();
        $view = $controller->indexAction($templating, $router);
        break;
    case 'post-create':
        $controller = new PostController();
        $view = $controller->createAction($_REQUEST['post'] ?? null, $templating, $router);
        break;
    case 'post-edit':
        if (! $_REQUEST['id']) {
            break;
        }
        $controller = new PostController();
        $view = $controller->editAction($_REQUEST['id'], $_REQUEST['post'] ?? null, $templating, $router);
        break;
    case 'post-show':
        if (! $_REQUEST['id']) {
            break;
        }
        $controller = new PostController();
        $view = $controller->showAction($_REQUEST['id'], $templating, $router);
        break;
    case 'post-delete':
        if (! $_REQUEST['id']) {
            break;
        }
        $controller = new PostController();
        $view = $controller->deleteAction($_REQUEST['id'], $router);
        break;
    case 'book-index':
        $controller = new BookController();
        $view = $controller->indexAction($templating, $router);
        break;
    case 'book-create':
        $controller = new BookController();
        $view = $controller->createAction($_REQUEST['book'] ?? null, $templating, $router);
        break;
    case 'book-edit':
        if (! $_REQUEST['id']) {
            break;
        }
        $controller = new BookController();
        $view = $controller->editAction($_REQUEST['id'], $_REQUEST['book'] ?? null, $templating, $router);
        break;
    case 'book-view':
        if (! $_REQUEST['id']) {
            break;
        }
        $controller = new BookController();
        $view = $controller->showAction($_REQUEST['id'], $templating, $router);
        break;
    case 'book-delete':
        if (! $_REQUEST['id']) {
            break;
        }
        $controller = new BookController();
        $view = $controller->deleteAction($_REQUEST['id'], $router);
        break;
    case 'info':
        $controller = new InfoController();
        $view = $controller->infoAction();
        break;
    default:
        $view = 'Not found';
        break;
}

if ($view) {
    echo $view;
}