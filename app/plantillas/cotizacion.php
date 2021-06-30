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

      
        #customers {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        font-size: 10px;
        }

        #customers td, #customers th {
        /* border: 1px solid #ddd; */
        padding: 8px;
        }

        #customers tr:nth-child(even){background-color: ;}

        #customers tr:hover {background-color: #;}

        #customers th {
        padding-top: 12px;
        padding-bottom: 12px;
        text-align: left;
        background-color: #D7E2E2;
        color: black;
        }

        #tb-cliente {
            font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        font-size: 10px;
        }
        #tb-cliente td, #tb-cliente th {
        /* border: 1px solid #ddd; */
        padding: 8px;
        }
        #tb-cliente span {
            font-weight: bold;
        }
        #customers td{
        border: 1px solid #ddd;
        padding: 8px;
        }
        #tb-info {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        font-size: 10px;
        }
        #tb-info td, #tb-info th {
        /* border: 1px solid #ddd; */
        padding: 8px;
        
        }
        #tb-empresa {
        font-family: Arial, Helvetica, sans-serif;
        border-collapse: collapse;
        width: 100%;
        font-size: 10px;
        font: small-caption;
        }
        
        #tb-empresa td, #tb-empresa th {
        /* border: 1px solid #ddd; */
        padding: 8px;
        }

        #codigo {
        font-family: Arial, Helvetica, sans-serif;
        text-align: right;
        font-size: 20px;
        }
        img{
          
            padding: 5px;
            width: 100px;
            height: 110px;
        }
        p {
            font-family: Arial;
            font-size: 12px;
            font-weight: bold;
            }
        #logotd{
            width: 150px;
            height: 200px;
        }

        #title {
            font-family: Arial;
            font-size: 8px;
            font-weight: bold;
        }
        #footer {
            font-family: "Times New Roman", Times, serif;
            font-size: 5px;
           
            text-align:center
        }
</style>

           <body>
      
         <div class='container-fluid'>
         <div class='row'>
             <table id='tb-empresa'>
                 <tr>
                     <td class='logotd'> <img src='{{logo}}' /></td>
                     
                     <td style='text-align:right' width='400px'>
                        
                             <p> {{nombreEmpresa}}</p> <br/>
                              {{direccionEmpresa}} <br/>
                              {{webEmpresa}} <br/>
                              {{correoEmpresa}}
                        
                     </td>
                 </tr>
             </table>
         </div>
         <div class='row'>
             <table id='tb-info'>
                 <tr>
                     <td> <span > Fecha {{fecha}} </span></td>
                    
                     <td style='text-align:right'>
                         
                         <span class='codigo '> Cotización # {{codigo}} </span>
                        
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
                       <span class='title'> Para: </span>{{para}} 
                      
                    </td>
                    
                </tr>
                <tr>
                    <td>
                    <span class='title'> Cliente: </span> {{cliente}} 
                  
                     
                    </td>
                </tr>
                <tr>
                    <td>
                    <span class='title'>DirecciónPara: </span>{{direccion}} 
                      
                    </td>
                    
                </tr>
                <tr>
                    <td>
                    <span class='title'> Correo: </span> {{correo}} 
                      
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
                             <td colspan='3' class='pie'>
                                 <h4>Subtotal</h4>
                             </td>
                             <td colspan='2'>
                                 <h4>{{subtotal}}</h4>
                             </td>
                         </tr>
                         <tr>
                             <td colspan='3' class='pie' ></td>
                             <td colspan='2'>{{impuestos}}</td>
                         </tr>
                         <tr>
                             <td colspan='3' class='pie'>
                                 <h4>Total</h4>
                             </td>
                             <td colspan='2'>
                                 <h4>{{total}}</h4>
                             </td>
                         </tr>
                     </tfoot>
                 </table>
             </div>
         </div>
      
     </div>
       
     
    </body>
    
   