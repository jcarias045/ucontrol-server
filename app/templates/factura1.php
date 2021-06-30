<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>factura</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>

<body>
    <?php echo "
    <div style="width: 100%;">
    <div class="row no-gutters">
        <div class="col-sm-6 col-md-8">
            {{nombrecliente}}
        </div>
        <div class="col-6 col-md-4">
            {{fechafactura}}
        </div>
</div>

    <div class="row no-gutters">
        <div class="col-sm-6 col-md-8">
            {{direccion}}
        </div>
        <div class="col-6 col-md-4">
            {{nit}}
        </div>
    </div>

    <div class="">
        <p class="">{{condicion}}</p>
    </div>
    </div>
    <div>
        <table class="table table-borderless">
            <tbody>
            {{tablaProductos}}
            </tbody>
        </table>
        
    </div>
    
<!--/body>

</html-->