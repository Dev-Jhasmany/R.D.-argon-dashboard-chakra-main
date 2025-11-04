# Exploración Frontend - Sistema de Pedidos y Ventas

## Archivos Generados

Esta exploración ha generado dos documentos completos:

### 1. **EXPLORACION_FRONTEND_PEDIDOS_VENTAS.md** (Documento Principal)
- Resumen ejecutivo del sistema
- Análisis detallado de 8 componentes principales
- Estructura de datos (Sale y Order)
- Rutas API utilizadas
- Flujos completos de usuario por rol
- Interacciones clave del sistema
- Casos de uso por rol (Vendedor, Cocinero, Administrador, Cliente)
- Conclusiones y patrones arquitectónicos

**Secciones principales:**
1. Archivos encontrados
2. Componente OrdersList.js (Pedidos Activos)
3. Componente OnlineOrders.js (Ventas Online)
4. Componente RegisterSale.js (Registro de Ventas)
5. Componente SalesList.js (Listado de Ventas)
6. Componente OrdersAdministration.js (Configuración de tiempos)
7. Componente OrdersHistory.js (Historial de Pedidos)
8. Servicios (orderService y salesService)
9. Flujos completos (Venta Normal, Venta Online, Pedido QR)
10. Estructura de datos detallada
11. Rutas API
12. Interacciones clave
13. Casos de uso por rol

### 2. **DIAGRAMA_FLUJO_PEDIDOS_VENTAS.md** (Diagramas ASCII)
- Flujo general del sistema (Venta → Pedido → Preparación)
- Flujo de Registro de Venta (RegisterSale.js)
- Flujo de Pedidos Activos (OrdersList.js)
- Flujo de Ventas Online (OnlineOrders.js)
- Comparación de Métodos de Pago
- Estructura de Venta vs Pedido
- Diagrama de tiempos y urgencias
- Ciclo de vida del pedido

---

## Resumen Rápido

### Componentes Encontrados

#### PEDIDOS (Orders)
| Componente | Archivo | Líneas | Propósito |
|-----------|---------|--------|-----------|
| OrdersList | `/src/views/Orders/OrdersList.js` | ~700 | Pedidos activos para cocinero |
| OnlineOrders | `/src/views/Orders/OnlineOrders.js` | ~365 | Ventas online para confirmar |
| OrdersAdministration | `/src/views/Orders/OrdersAdministration.js` | ~413 | Gestión de tiempos de preparación |
| OrdersHistory | `/src/views/Orders/OrdersHistory.js` | ~420 | Historial de pedidos completados |

#### VENTAS (Sales)
| Componente | Archivo | Líneas | Propósito |
|-----------|---------|--------|-----------|
| RegisterSale | `/src/views/Sales/RegisterSale.js` | 2090 | Sistema POS completo |
| SalesList | `/src/views/Sales/SalesList.js` | 629 | Listado y búsqueda de ventas |

#### SERVICIOS
| Servicio | Archivo | Funciones |
|---------|---------|-----------|
| orderService | `/src/services/orderService.js` | 10 funciones para órdenes |
| salesService | `/src/services/salesService.js` | 8 funciones para ventas |

---

## Flujo Principal

```
VENDEDOR                 CLIENTE ONLINE           ADMINISTRADOR
    │                           │                      │
    ▼                           ▼                      ▼
Registra Venta          Compra en web          Confirma Pago
RegisterSale.js         + Realiza Pago         OnlineOrders.js
    │                           │                      │
    │ salesService.createSale() │                      │
    │ POST /sales               │                      │
    └───────────┬───────────────┴──────────────────────┘
                │
                ▼ Backend crea VENTA
    createOrderFromSale() (automático en frontend)
                │
                ▼ orderService.createOrder()
                │ POST /orders
                │
                ▼
    COCINERO (OrdersList.js)
    ├─ Recepciona Pedido (status: received)
    ├─ Prepara Productos
    └─ Marca Concluido (status: completed)
                │
                ▼
    OrdersHistory.js
    ├─ Aparece en historial
    ├─ Calcula tiempos
    └─ Auditoría de operaciones
```

---

## Características Clave

### 1. Auto-refresh
- **OrdersList:** Cada 30 segundos
- **OnlineOrders:** Cada 30 segundos
- **MyOrders (Cliente):** Cada 5 segundos

### 2. Cálculo de Urgencia (OrdersList)
```javascript
// Buscamientos automáticos
minutesUntilStart = (deliveryTime - estimatedPrepTime) - now

ROJO    → <= 0 min (AHORA)
NARANJA → <= 5 min (CRÍTICO)
AMARILLO → <= 15 min (PRÓXIMO)
VERDE   → > 15 min (DISPONIBLE)
```

### 3. Métodos de Pago Soportados
- **Efectivo** → Ticket inmediato
- **QR** → Modal con código QR (JSON con datos)
- **PayPal** → Modal con flujo de email (input→sending→waiting→confirmed)
- **Stripe** → Modal con flujo de teléfono (input→sending→waiting→confirmed)

### 4. Estados del Pedido
```
pending → received → in_progress → completed → delivered
            ↓                         ↓
        (cocinero             (listo para
         recepcionó)           entregar)
```

### 5. Diferenciación Online vs Normal
- **Normal:** created_by_id = vendedor
- **Online:** created_by_id = NULL, datos en notas o delivery_address

---

## Uso por Rol

### VENDEDOR
```
✓ Acceso: RegisterSale
✓ Funciones:
  - Crear carrito de compra
  - Agregar/quitar productos
  - Seleccionar método de pago
  - Registrar cliente (opcional)
  - Aplicar descuentos
  - Ver ticket
  - Revisar historial últimas 10 ventas
  - Ver inventario
```

### COCINERO
```
✓ Acceso: OrdersList, OrdersHistory
✓ Funciones:
  - Ver pedidos activos (refresh cada 30s)
  - Leer urgencia en color
  - Recepcionar pedido
  - Preparar productos
  - Marcar como concluido
  - Filtrar historial por estado
  - Exportar reportes
```

### ADMINISTRADOR
```
✓ Acceso: OnlineOrders, OrdersAdministration, SalesList, OrdersHistory
✓ Funciones:
  - Confirmar pagos online
  - Editar tiempos de preparación (productos/promociones)
  - Ver todas las ventas
  - Buscar y filtrar ventas
  - Exportar a PDF/Excel
  - Eliminar registros
  - Ver estadísticas
```

### CLIENTE ONLINE
```
✓ Acceso: MyOrders
✓ Puede ver:
  - Número de pedido
  - Estado (pending/confirmed/rejected)
  - Fecha y hora
  - Productos
  - Total pagado
  - Dirección de entrega
  - Comprobante de pago
```

---

## Validaciones Principales

### Carrito
- ✓ No vacío
- ✓ Stock suficiente para cada producto
- ✓ Cantidad > 0
- ✓ Promociones solo con cantidad 1

### Venta
- ✓ Caja abierta seleccionada
- ✓ Al menos un producto en carrito
- ✓ Método de pago definido

### Pedido
- ✓ Usuario autenticado
- ✓ Hora actual >= hora de inicio de preparación
- ✓ Estado actual permite la acción

---

## Componentes Relacionados

### TicketReceipt
- **Ubicación:** `/src/components/TicketReceipt/TicketReceipt.js`
- **Propósito:** Impresión/visualización de ticket de venta
- **Datos:** Información completa de venta + productos + total

### Servicios Utilizados
- `orderService.js` - Gestión de pedidos
- `salesService.js` - Gestión de ventas
- `productService.js` - Productos
- `promotionService.js` - Promociones
- `settingsService.js` - Configuración
- `cashRegisterService.js` - Cajas registradoras

---

## Endpoints Clave

### Pedidos
```
GET    /orders                      Todos los pedidos
GET    /orders/active               Activos (para cocinero)
POST   /orders                      Crear
PATCH  /orders/{id}/receive         Recepcionar
PATCH  /orders/{id}/complete        Concluir
PATCH  /orders/preparation-time     Actualizar tiempo
```

### Ventas
```
GET    /sales                       Todas
POST   /sales                       Crear
PATCH  /sales/{id}/confirm-online   Confirmar online
DELETE /sales/{id}                  Eliminar
```

---

## Conclusiones

### Patrón Arquitectónico
El sistema sigue un patrón donde:
1. **VENTA** = Registro contable/POS
2. **PEDIDO** = Gestión operativa de cocina
3. Toda venta crea automáticamente un pedido
4. Los pedidos online requieren confirmación de admin antes de crear pedido

### Fortalezas Observadas
- ✓ Auto-refresh de datos en tiempo real
- ✓ Cálculo inteligente de urgencias
- ✓ Múltiples métodos de pago
- ✓ Diferenciación clara entre roles
- ✓ Tracking completo de tiempos
- ✓ Exportación a múltiples formatos
- ✓ Validaciones exhaustivas

### Áreas Monitoreadas
- Sistema de actualización de estado en tiempo real
- Manejo de errores en transacciones
- Sincronización venta-pedido
- Cálculo de tiempos estimados
- Gestión de cajas registradoras

---

## Cómo Usar Esta Documentación

### Para Desarrolladores
1. Leer `EXPLORACION_FRONTEND_PEDIDOS_VENTAS.md` para entender el sistema
2. Revisar `DIAGRAMA_FLUJO_PEDIDOS_VENTAS.md` para ver flujos visuales
3. Consultar las secciones de "Estructura de Datos" para entender el modelo
4. Revisar "Interacciones Clave" para casos específicos

### Para Product Owners
1. Leer "Resumen Ejecutivo" de la exploración
2. Revisar "Casos de Uso por Rol"
3. Consultar diagramas de flujo para validaciones
4. Ver "Flujos Completos de Usuario"

### Para QA/Testers
1. Revisar "Validaciones Principales"
2. Leer "Interacciones Clave" para casos de prueba
3. Consultar "Ciclo de Vida del Pedido"
4. Verificar métodos de pago en diagramas

---

## Contacto y Preguntas

Para dudas sobre la exploración, consultar:
1. Secciones específicas en `EXPLORACION_FRONTEND_PEDIDOS_VENTAS.md`
2. Diagramas en `DIAGRAMA_FLUJO_PEDIDOS_VENTAS.md`
3. Archivos de código mencionados (rutas completas)

---

**Generado:** 2024-11-04
**Versión:** 1.0
**Estado:** Exploración Completa
