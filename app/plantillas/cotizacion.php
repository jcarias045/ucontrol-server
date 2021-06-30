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
        .pie{
            text-align: right;
        }

        p {
        font-size: 14px;
        }
        #customers {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        font-size: 10px;
        }

        #customers td, #customers th {
        border: 1px solid #ddd;
        padding: 8px;
        }

        #customers tr:nth-child(even){background-color: #f2f2f2;}

        #customers tr:hover {background-color: #ddd;}

        #customers th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #04AA6D;
        color: white;
        }

        #tb-cliente {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        font-size: 15px;
        }
        #customers td{
        border: 1px solid #ddd;
        padding: 8px;
        }
        #tb-info {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        font-size: 15px;
        }

        #codigo {
        font-family: Arial, Helvetica, sans-serif;
    
        font-size: 15px;
        }
</style>

           <body>
      
         <div class='container-fluid'>
         <div class='row'>
             <table id='tb-empresa'>
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
             <table id='tb-info'>
                 <tr>
                     <td> <small>Fecha</small> <h6> {{fecha}}</h6></td>
                     <td width='250px'> </td>
                     <td style='text-align:right' width='450px'>
                         <div class='col'
                         <small>Cotización</small>
                         <p class='codigo'> # {{codigo}} </p>
                        
                     </td>
                 </tr>
             </table>
            
         </div>
         
         <hr>
         <div class='row'>
             <div class='col-10'>
            <table id='tb-cliente'>
                <tr>
                    <td>
                        Para: {{para}} 
                      
                    </td>
                    
                </tr>
                <tr>
                    <td>
                    Cliente: {{cliente}} 
                  
                     
                    </td>
                </tr>
                <tr>
                    <td>
                    Dirección: {{direccion}} 
                      
                    </td>
                    
                </tr>
                <tr>
                    <td>
                    Correo: {{correo}} 
                      
                    </td>
                    
                </tr>
            </table>
            
             </div>
        
         </div>
         <hr>
  
         <div class='row'>
             <div class='col-xs-12'>
                 <table  id="customers">
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
                             <td colspan='4' class='pie'>
                                 <h4>Subtotal</h4>
                             </td>
                             <td>
                                 <h4>{{subtotal}}</h4>
                             </td>
                         </tr>
                         <tr>
                             <td colspan='4' class='pie' ></td>
                             <td>{{impuestos}}</td>
                         </tr>
                         <tr>
                             <td colspan='4' class='pie'>
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
    
   