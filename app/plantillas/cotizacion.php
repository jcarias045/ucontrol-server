<!-- 

        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
        -->
    <style>
        h1 {
        font-size: 40px;
        }

        .empresa {
        font-size: 10px;
        }
        .cliente {
        font-size: 15px;
        }

        p {
        font-size: 14px;
        }
</style>

           <body>
      
         <div class='container-fluid'>
         <div class='row'>
             <table>
                 <tr>
                     <td> {{logo}}</td>
                    
                     <td style='text-align:right' width='400px'>
                         <div class='col'
                             <p class='empresa'> {{nombreEmpresa}} </p>
                             <p class='empresa'> {{direccionEmpresa}} </p>
                             <p class='empresa'> {{webEmpresa}} </p>
                        
                     </td>
                 </tr>
             </table>
         </div>
         <div class='row'>
             <table>
                 <tr>
                     <td> <small>Fecha</small> <h6> {{fecha}}</h6></td>
                     <td width='250px'> </td>
                     <td style='text-align:right' width='450px'>
                         <div class='col'
                         <small>Cotización</small>
                         <h1 class='h2'> # {{codigo}} </h1>
                        
                     </td>
                 </tr>
             </table>
            
         </div>
         
         <hr>
         <div class='row'>
             <div class='col-10'>
             <strong>Paraphp:</strong>    <h1 class='cliente'><?php print("GOLA ") ?> {{para}} </h1>
             <strong>Cliente:</strong>    <h1 class='cliente'> {{cliente}} </h1>
             <strong>Dirección:</strong>    <h1 class='cliente'> {{direccion}} </h1>
             <strong>Correo:</strong>    <h1 class='cliente'> {{correo}} </h1>
             </div>
        
         </div>
         <hr>
  
         <div class='row'>
             <div class='col-xs-12'>
                 <table  class='table table-hover'>
                     <thead  class='thead-dark'>
                         <tr>
                             <th>Cantidad</th>
                             <th>Nombre</th>
                             <th>Medida</th>
                             <th>Precio</th>
                             <th>Total</th>
                         </tr>
                     </thead>
                     <tbody>
                         {{tablaProductos}}
                     </tbody>
                     <tfoot>
                         <tr>
                             <td colspan='3' class='text-right'>
                                 <h4>Subtotal</h4>
                             </td>
                             <td>
                                 <h4>{{subtotal}}</h4>
                             </td>
                         </tr>
                         <tr>
                             <td colspan='3' class='text-right' ></td>
                             <td>{{impuestos}}</td>
                         </tr>
                         <tr>
                             <td colspan='3' class='text-right'>
                                 <h4>Total</h4>
                             </td>
                             <td>
                                 <h4>{{total}}</h4>
                             </td>
                         </tr>
                     </tfoot>
                 </table>
             </div>
         </div>
      
     </div>
       
     
    </body>
    
   