# Diagrama de Actividades - Frontend React

Este documento contiene los vínculos a los archivos de lógica de cada módulo del frontend. Estos archivos son fundamentales para crear **diagramas de secuencia** que modelan la interacción entre componentes en el tiempo.

---

## 1. Autenticación - Login/Registro/Reset Password

### Descripción
Módulo de autenticación que maneja el inicio de sesión, registro y recuperación de contraseña.

### Archivos de Lógica

#### Páginas (Views)
- **SignIn.js:** `R.D.-argon-dashboard-chakra-main/src/views/Pages/SignIn.js`
  - **Responsabilidad:** Formulario de inicio de sesión, manejo de estado de "Recordarme", validación de credenciales

- **SignUp.js:** `R.D.-argon-dashboard-chakra-main/src/views/Pages/SignUp.js`
  - **Responsabilidad:** Formulario de registro de usuarios (si está habilitado)

- **ResetPassword.js:** `R.D.-argon-dashboard-chakra-main/src/views/Pages/ResetPassword.js`
  - **Responsabilidad:** Formulario de recuperación de contraseña, envío de token

#### Servicio (API Integration)
- **authService.js:** `R.D.-argon-dashboard-chakra-main/src/services/authService.js`
  - **Responsabilidad:** Llamadas API de autenticación
  - **Métodos:**
    - `login(email, password)`: POST /auth/login
    - `register(userData)`: POST /auth/register
    - `forgotPassword(email)`: POST /auth/forgot-password
    - `resetPassword(token, newPassword)`: POST /auth/reset-password

#### Contexto de Estado
- **AuthContext.js:** `R.D.-argon-dashboard-chakra-main/src/contexts/AuthContext.js`
  - **Responsabilidad:** Gestión de estado global de autenticación
  - **Estado:**
    - user, token, loading, isAuthenticated
  - **Funciones:**
    - login(), logout(), validateToken(), changePassword(), updateUserProfile()

#### Layout
- **Auth.js:** `R.D.-argon-dashboard-chakra-main/src/layouts/Auth.js`
  - **Responsabilidad:** Layout para páginas de autenticación (sin sidebar)

### Flujo de Secuencia Principal (Login)
```
Usuario → SignIn.js (formulario) → authService.login(email, password)
                                          ↓
                                    POST /auth/login → Backend
                                          ↓
                                    Respuesta: { token, user }
                                          ↓
                                    AuthContext.login() → Guarda en localStorage/sessionStorage
                                          ↓
                                    Axios interceptor configura Bearer token
                                          ↓
                                    Redirecciona a /admin/dashboard
```

---

## 2. Dashboard - Estadísticas y Analíticas

### Descripción
Dashboard principal que muestra estadísticas en tiempo real, productos más vendidos y alertas.

### Archivos de Lógica

#### Página Principal
- **Dashboard.js:** `R.D.-argon-dashboard-chakra-main/src/views/Dashboard/Dashboard.js`
  - **Responsabilidad:** Renderizar widgets de estadísticas, gráficos, alertas de stock bajo

#### Servicio
- **dashboardService.js:** `R.D.-argon-dashboard-chakra-main/src/services/dashboardService.js`
  - **Responsabilidad:** Obtener datos del dashboard desde el backend
  - **Métodos:**
    - `getGeneralStats()`: Estadísticas generales
    - `getTodaySales()`: Ventas del día
    - `getTopProducts()`: Productos más vendidos
    - `getSalesByPeriod(period)`: Ventas por período
    - `getLowStockProducts(threshold)`: Productos con stock bajo
    - `getRecentActivity()`: Actividad reciente

#### Componentes Relacionados
- **Card.js:** `R.D.-argon-dashboard-chakra-main/src/components/Card/Card.js`
  - Contenedor de tarjetas para widgets
- **DashboardTableRow.js:** `R.D.-argon-dashboard-chakra-main/src/components/Tables/DashboardTableRow.js`
  - Filas de tabla del dashboard

### Flujo de Secuencia Principal
```
Dashboard.js (useEffect) → dashboardService.getGeneralStats()
                                    ↓
                              GET /dashboard/general-stats → Backend
                                    ↓
                              Backend procesa estadísticas (SUM, COUNT, agregaciones)
                                    ↓
                              Respuesta JSON con métricas
                                    ↓
                              Dashboard.js actualiza estado
                                    ↓
                              Re-renderiza widgets con datos
```

---

## 3. Gestión de Usuarios

### Descripción
CRUD completo de usuarios con gestión de permisos y cambio de contraseña.

### Archivos de Lógica

#### Páginas (Views)
- **RegisterUser.js:** `R.D.-argon-dashboard-chakra-main/src/views/Users/RegisterUser.js`
  - **Responsabilidad:** Formulario de registro de nuevo usuario, selección de rol

- **ListUsers.js:** `R.D.-argon-dashboard-chakra-main/src/views/Users/ListUsers.js`
  - **Responsabilidad:** Tabla de listado de usuarios, acciones de editar/eliminar

- **ChangePassword.js:** `R.D.-argon-dashboard-chakra-main/src/views/Users/ChangePassword.js`
  - **Responsabilidad:** Formulario de cambio de contraseña del usuario actual

- **UserInfo.js:** `R.D.-argon-dashboard-chakra-main/src/views/Users/UserInfo.js`
  - **Responsabilidad:** Visualización y edición del perfil de usuario

#### Servicio
- **userService.js:** `R.D.-argon-dashboard-chakra-main/src/services/userService.js`
  - **Responsabilidad:** API de gestión de usuarios
  - **Métodos:**
    - `getAllUsers()`: GET /users
    - `getUserById(id)`: GET /users/:id
    - `createUser(userData)`: POST /users
    - `updateUser(id, userData)`: PUT /users/:id
    - `deleteUser(id)`: DELETE /users/:id
    - `changePassword(currentPassword, newPassword)`: POST /users/change-password

### Flujo de Secuencia Principal (Crear Usuario)
```
RegisterUser.js (submit) → Validar formulario
                                ↓
                          userService.createUser(userData)
                                ↓
                          POST /users → Backend
                                ↓
                          Backend valida datos, hashea contraseña, crea usuario
                                ↓
                          ActivityLog registra acción
                                ↓
                          Respuesta: { message, user }
                                ↓
                          RegisterUser.js muestra notificación de éxito
                                ↓
                          Redirige a /admin/users/list-users
```

---

## 4. Gestión de Roles y Permisos

### Descripción
Sistema de control de acceso basado en roles (RBAC) con asignación de permisos.

### Archivos de Lógica

#### Roles
- **RegisterRole.js:** `R.D.-argon-dashboard-chakra-main/src/views/Roles/RegisterRole.js`
  - **Responsabilidad:** Crear rol con nombre, jerarquía y permisos

- **ListRoles.js:** `R.D.-argon-dashboard-chakra-main/src/views/Roles/ListRoles.js`
  - **Responsabilidad:** Listar roles, editar y eliminar

- **roleService.js:** `R.D.-argon-dashboard-chakra-main/src/services/roleService.js`
  - **Métodos:** getAllRoles, getRoleById, createRole, updateRole, deleteRole

#### Grupos
- **RegisterGroup.js:** `R.D.-argon-dashboard-chakra-main/src/views/Roles/RegisterGroup.js`
  - **Responsabilidad:** Crear grupo de usuarios

- **ListGroups.js:** `R.D.-argon-dashboard-chakra-main/src/views/Roles/ListGroups.js`
  - **Responsabilidad:** Listar grupos de usuarios

- **groupService.js:** `R.D.-argon-dashboard-chakra-main/src/services/groupService.js`
  - **Métodos:** getAllGroups, getGroupById, createGroup, updateGroup, deleteGroup

#### Permisos
- **RegisterPermission.js:** `R.D.-argon-dashboard-chakra-main/src/views/Permissions/RegisterPermission.js`
  - **Responsabilidad:** Crear permiso con nombre, recurso y acción

- **ListPermissions.js:** `R.D.-argon-dashboard-chakra-main/src/views/Permissions/ListPermissions.js`
  - **Responsabilidad:** Listar permisos

- **permissionService.js:** `R.D.-argon-dashboard-chakra-main/src/services/permissionService.js`
  - **Métodos:** getAllPermissions, getPermissionById, createPermission, updatePermission, deletePermission

#### Hook de Permisos
- **usePermissions.js:** `R.D.-argon-dashboard-chakra-main/src/hooks/usePermissions.js`
  - **Responsabilidad:** Filtrar rutas basado en permisos del usuario
  - **Lógica:**
    - Detecta Super Admin (jerarquía 0) → Acceso total
    - Mapea categorías a IDs de permisos
    - Filtra menú dinámicamente

### Flujo de Secuencia Principal (Asignar Permisos a Rol)
```
RegisterRole.js → Usuario selecciona permisos (checkboxes)
                        ↓
                  roleService.createRole({ name, hierarchy, permissionIds })
                        ↓
                  POST /roles → Backend
                        ↓
                  Backend crea rol y asocia permisos (M2M)
                        ↓
                  usePermissions hook se actualiza al re-login
                        ↓
                  Sidebar re-renderiza con nuevos permisos
```

---

## 5. Gestión de Productos e Inventario

### Descripción
CRUD de productos con categorías, control de stock y entradas de suministros.

### Archivos de Lógica

#### Productos
- **RegisterProduct.js:** `R.D.-argon-dashboard-chakra-main/src/views/Products/RegisterProduct.js`
  - **Responsabilidad:** Formulario de creación de producto con categoría, precio, stock

- **ListProducts.js:** `R.D.-argon-dashboard-chakra-main/src/views/Products/ListProducts.js`
  - **Responsabilidad:** Tabla de productos con filtros, búsqueda, acciones

- **productService.js:** `R.D.-argon-dashboard-chakra-main/src/services/productService.js`
  - **Métodos:**
    - getAllProducts(), getProductById(id)
    - createProduct(productData), updateProduct(id, productData)
    - deleteProduct(id), toggleProductStatus(id)

#### Categorías
- **RegisterCategory.js:** `R.D.-argon-dashboard-chakra-main/src/views/Products/RegisterCategory.js`
  - **Responsabilidad:** Crear categoría de productos

- **categoryService.js:** `R.D.-argon-dashboard-chakra-main/src/services/categoryService.js`
  - **Métodos:** getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory

#### Stock Control
- **StockControl.js:** `R.D.-argon-dashboard-chakra-main/src/views/Products/StockControl.js`
  - **Responsabilidad:** Visualización de inventario, movimientos de stock

- **stockMovementService.js:** `R.D.-argon-dashboard-chakra-main/src/services/stockMovementService.js`
  - **Métodos:** getAllStockMovements, getStockMovementById, createStockMovement

#### Entradas de Suministros
- **SupplyEntry.js:** `R.D.-argon-dashboard-chakra-main/src/views/Products/SupplyEntry.js`
  - **Responsabilidad:** Registrar entrada de productos desde proveedores

- **supplyEntryService.js:** `R.D.-argon-dashboard-chakra-main/src/services/supplyEntryService.js`
  - **Métodos:** getAllSupplyEntries, getSupplyEntryById, createSupplyEntry, updateSupplyEntry, deleteSupplyEntry

### Flujo de Secuencia Principal (Crear Producto)
```
RegisterProduct.js (submit) → Validar formulario (nombre, precio, categoría, stock)
                                    ↓
                              productService.createProduct(productData)
                                    ↓
                              POST /products → Backend
                                    ↓
                              Backend genera código único (PROD-YYYYMMDD-XXXX)
                                    ↓
                              Valida categoría existe
                                    ↓
                              Crea producto en DB
                                    ↓
                              ActivityLog registra CREATE
                                    ↓
                              Respuesta: producto creado
                                    ↓
                              RegisterProduct.js muestra notificación
                                    ↓
                              Redirige a lista de productos
```

---

## 6. Gestión de Ventas

### Descripción
Registro de ventas con múltiples productos, cálculo de totales y 6 métodos de pago diferentes (efectivo, tarjeta, transferencia, QR, PayPal, Stripe).

### Archivos de Lógica

#### Páginas
- **RegisterSale.js:** `R.D.-argon-dashboard-chakra-main/src/views/Sales/RegisterSale.js`
  - **Responsabilidad:** Formulario de venta con selección de productos, cantidades, múltiples métodos de pago
  - **Características:**
    - Carrito de compras dinámico
    - Cálculo automático de subtotales y totales
    - Aplicación de descuentos y promociones
    - Soporte para 6 métodos de pago
    - Modales específicos para pagos digitales (QR, PayPal, Stripe)
    - Generación de código QR
    - Historial de ventas recientes
    - Visualización de inventario con bajo stock

- **SalesList.js:** `R.D.-argon-dashboard-chakra-main/src/views/Sales/SalesList.js`
  - **Responsabilidad:** Historial de ventas, visualización de detalles, exportación
  - **Características:**
    - Tabla de ventas con filtros
    - Visualización de método de pago usado
    - Exportación a PDF/Excel
    - Detalles de cada venta

#### Servicio
- **salesService.js:** `R.D.-argon-dashboard-chakra-main/src/services/salesService.js`
  - **Responsabilidad:** API de ventas
  - **Métodos:**
    - `getAllSales()`: GET /sales
    - `getSaleById(id)`: GET /sales/:id
    - `createSale(saleData)`: POST /sales

### Métodos de Pago Soportados (Frontend)

El frontend implementa una interfaz completa para 6 métodos de pago con experiencias personalizadas:

#### 1. **EFECTIVO** (`efectivo`)
- **UI**: Select simple, opción por defecto
- **Flujo**: Confirmación inmediata
- **No requiere**: Modales o pasos adicionales
- **Estado**: `formData.payment_method = 'efectivo'`

#### 2. **TARJETA** (`tarjeta`)
- **UI**: Select simple
- **Flujo**: Confirmación inmediata
- **Procesamiento**: Terminal física (POS) no integrado
- **Estado**: `formData.payment_method = 'tarjeta'`

#### 3. **TRANSFERENCIA** (`transferencia`)
- **UI**: Select simple
- **Flujo**: Confirmación inmediata
- **Verificación**: Manual por el vendedor
- **Estado**: `formData.payment_method = 'transferencia'`

#### 4. **QR** (`qr`)
- **UI**: Select + Modal con código QR generado
- **Componente**: `<QRCodeSVG />` de librería qrcode.react
- **Flujo**:
  1. Usuario selecciona "QR"
  2. Se abre modal `isQRModalOpen`
  3. Frontend genera QR con datos de venta (total, número)
  4. Cliente escanea QR con billetera digital
  5. Vendedor confirma pago
  6. Se registra venta
- **Estados**: `isQRModalOpen`, `saleInfo`

#### 5. **PAYPAL** (`paypal`)
- **UI**: Select + Modal para capturar email
- **Estados gestionados**:
  - `paypalEmail`: Email del cliente PayPal
  - `paypalStatus`: 'input' | 'sending' | 'waiting' | 'confirmed'
  - `isPayPalModalOpen`: Control del modal
- **Flujo**:
  1. Usuario selecciona "PayPal"
  2. Se abre modal `isPayPalModalOpen`
  3. Vendedor ingresa email del cliente
  4. Estado: 'input'
  5. Click en "Enviar Solicitud"
  6. Estado: 'sending' (muestra spinner)
  7. Sistema envía solicitud de pago a email
  8. Estado: 'waiting' (esperando confirmación)
  9. Cliente confirma pago en PayPal
  10. Estado: 'confirmed'
  11. Se registra venta
- **Componentes UI**: Input email, botones de estado, indicadores de progreso

#### 6. **STRIPE** (`stripe`)
- **UI**: Select + Modal para capturar teléfono y método de envío
- **Estados gestionados**:
  - `stripePhone`: Teléfono del cliente
  - `stripeMethod`: 'whatsapp' | 'sms'
  - `stripeStatus`: 'input' | 'sending' | 'waiting' | 'confirmed'
  - `isStripeModalOpen`: Control del modal
- **Flujo**:
  1. Usuario selecciona "Stripe"
  2. Se abre modal `isStripeModalOpen`
  3. Vendedor ingresa teléfono del cliente
  4. Vendedor selecciona método: WhatsApp o SMS
  5. Estado: 'input'
  6. Click en "Enviar Link"
  7. Estado: 'sending' (muestra spinner)
  8. Sistema envía link de pago por WhatsApp/SMS
  9. Estado: 'waiting' (esperando confirmación)
  10. Cliente completa pago en Stripe
  11. Estado: 'confirmed'
  12. Se registra venta
- **Componentes UI**: Input teléfono, radio buttons (WhatsApp/SMS), botones de estado

### Estado del Formulario de Venta

```javascript
const [formData, setFormData] = useState({
  customer_name: '',           // Nombre del cliente
  customer_nit: '',            // NIT del cliente
  discount: 0,                 // Descuento aplicado
  payment_method: 'efectivo',  // Método de pago (default: efectivo)
  notes: '',                   // Notas adicionales
});

// Estados para modales de pago
const [isQRModalOpen, setIsQRModalOpen] = useState(false);
const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false);
const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

// Estados específicos de PayPal
const [paypalEmail, setPaypalEmail] = useState('');
const [paypalStatus, setPaypalStatus] = useState('input');

// Estados específicos de Stripe
const [stripePhone, setStripePhone] = useState('');
const [stripeMethod, setStripeMethod] = useState('whatsapp');
const [stripeStatus, setStripeStatus] = useState('input');
```

### Flujo de Secuencia Principal (Registrar Venta con Métodos de Pago)

```
RegisterSale.js → Usuario agrega productos al carrito
                        ↓
                  Calcula subtotales, descuentos, total
                        ↓
                  Usuario selecciona método de pago
                        ↓
    ┌───────────────────┼───────────────────┐
    │                   │                   │
Efectivo/          QR/PayPal/         Tarjeta/
Tradicional        Digital             Manual
    │                   │                   │
    ↓                   ↓                   ↓
Confirmación      Modal abierto      Confirmación
inmediata      (captura datos)        inmediata
    │                   │                   │
    │            Email/Teléfono             │
    │            Código QR                  │
    │                   │                   │
    │            Estado: sending            │
    │            → waiting                  │
    │            → confirmed                │
    │                   │                   │
    └───────────────────┴───────────────────┘
                        ↓
                  Submit → salesService.createSale(saleData)
                        ↓
                  POST /sales → Backend
                        ↓
                  Backend valida método de pago (enum)
                        ↓
                  Backend valida stock de cada producto
                        ↓
                  Genera número de venta (VEN-YYYYMMDD-XXXX)
                        ↓
                  Crea Sale (con payment_method) y SaleDetails
                        ↓
                  Actualiza stock de productos (-cantidad vendida)
                        ↓
                  Registra StockMovements (tipo SALE)
                        ↓
                  ActivityLog registra venta (incluye método de pago)
                        ↓
                  Respuesta: venta creada
                        ↓
                  RegisterSale.js muestra recibo
                        ↓
                  Opción de imprimir PDF con método de pago
                        ↓
                  Limpia formulario y cierra modales
                        ↓
                  Resetea estados de pago (paypalStatus, stripeStatus)
                        ↓
                  Lista para nueva venta
```

### Validación de Métodos de Pago (Frontend)

**En RegisterSale.js:**
```javascript
// Select de método de pago
<Select
  value={formData.payment_method}
  onChange={(e) => {
    const method = e.target.value;
    setFormData({ ...formData, payment_method: method });

    // Abrir modal según método seleccionado
    if (method === 'qr') setIsQRModalOpen(true);
    if (method === 'paypal') setIsPayPalModalOpen(true);
    if (method === 'stripe') setIsStripeModalOpen(true);
  }}
>
  <option value="efectivo">Efectivo</option>
  <option value="tarjeta">Tarjeta</option>
  <option value="transferencia">Transferencia</option>
  <option value="qr">Código QR</option>
  <option value="paypal">PayPal</option>
  <option value="stripe">Stripe</option>
</Select>
```

### Componentes de UI para Métodos de Pago

#### Modal de Código QR
- **Biblioteca**: qrcode.react
- **Componente**: `<QRCodeSVG value={JSON.stringify(saleInfo)} />`
- **Datos del QR**: Número de venta, total, timestamp
- **Tamaño**: 256x256 pixels
- **Acción**: Cliente escanea → Paga → Vendedor confirma

#### Modal de PayPal
- **Input**: Email del cliente
- **Botones**: "Enviar Solicitud", "Cancelar"
- **Indicadores**: Spinner durante envío, check en confirmación
- **Estados visuales**: input (azul), sending (amarillo), waiting (naranja), confirmed (verde)

#### Modal de Stripe
- **Inputs**:
  - Teléfono del cliente (Input)
  - Método de envío (Radio: WhatsApp / SMS)
- **Botones**: "Enviar Link", "Cancelar"
- **Indicadores**: Spinner durante envío, check en confirmación
- **Estados visuales**: input (azul), sending (amarillo), waiting (naranja), confirmed (verde)

### Integración Backend-Frontend

| Método | Frontend Envía | Backend Recibe | Backend Valida |
|--------|----------------|----------------|----------------|
| efectivo | `payment_method: 'efectivo'` | enum value | ✅ IsEnum |
| tarjeta | `payment_method: 'tarjeta'` | enum value | ✅ IsEnum |
| transferencia | `payment_method: 'transferencia'` | enum value | ✅ IsEnum |
| qr | `payment_method: 'qr'` | enum value | ✅ IsEnum |
| paypal | `payment_method: 'paypal'` | enum value | ✅ IsEnum |
| stripe | `payment_method: 'stripe'` | enum value | ✅ IsEnum |

**Nota**: El frontend solo envía el tipo de método de pago. Los detalles adicionales (email PayPal, teléfono Stripe) se gestionan en el frontend para UX pero no se almacenan en la venta actualmente.

---

## 7. Gestión de Proveedores

### Descripción
CRUD de proveedores con información de contacto.

### Archivos de Lógica

#### Páginas
- **RegisterSupplier.js:** `R.D.-argon-dashboard-chakra-main/src/views/Suppliers/RegisterSupplier.js`
  - **Responsabilidad:** Formulario de creación de proveedor

- **ListSuppliers.js:** `R.D.-argon-dashboard-chakra-main/src/views/Suppliers/ListSuppliers.js`
  - **Responsabilidad:** Lista de proveedores con acciones

#### Servicio
- **supplierService.js:** `R.D.-argon-dashboard-chakra-main/src/services/supplierService.js`
  - **Métodos:** getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier

### Flujo de Secuencia Principal
```
RegisterSupplier.js → supplierService.createSupplier(supplierData)
                            ↓
                      POST /suppliers → Backend
                            ↓
                      Backend crea proveedor
                            ↓
                      ActivityLog registra CREATE
                            ↓
                      Respuesta: proveedor creado
```

---

## 8. Gestión de Promociones

### Descripción
Creación y gestión de promociones con descuentos y fechas de vigencia.

### Archivos de Lógica

#### Páginas
- **RegisterPromotion.js:** `R.D.-argon-dashboard-chakra-main/src/views/Promotions/RegisterPromotion.js`
  - **Responsabilidad:** Crear promoción con porcentaje de descuento, fechas

- **ListPromotions.js:** `R.D.-argon-dashboard-chakra-main/src/views/Promotions/ListPromotions.js`
  - **Responsabilidad:** Listar promociones activas e inactivas

#### Servicio
- **promotionService.js:** `R.D.-argon-dashboard-chakra-main/src/services/promotionService.js`
  - **Métodos:** getAllPromotions, getPromotionById, createPromotion, updatePromotion, deletePromotion

### Flujo de Secuencia Principal
```
RegisterPromotion.js → promotionService.createPromotion(promotionData)
                              ↓
                        POST /promotions → Backend
                              ↓
                        Backend crea promoción
                              ↓
                        Respuesta: promoción creada
```

---

## 9. Configuración y Auditoría

### Descripción
Registro de actividades y configuración del sistema.

### Archivos de Lógica

#### Activity Log
- **ActivityLog.js:** `R.D.-argon-dashboard-chakra-main/src/views/Settings/ActivityLog.js`
  - **Responsabilidad:** Tabla de auditoría con filtros por usuario, módulo, fecha

- **activityLogService.js:** `R.D.-argon-dashboard-chakra-main/src/services/activityLogService.js`
  - **Métodos:**
    - `getAllActivityLogs()`: GET /activity-log
    - `getActivityLogsByModule(module)`: GET /activity-log/module/:module
    - `getActivityLogsByUser(userId)`: GET /activity-log/user/:userId
    - `getActivityLogsByDateRange(startDate, endDate)`: GET /activity-log/date-range

#### Logout
- **Logout.js:** `R.D.-argon-dashboard-chakra-main/src/views/Settings/Logout.js`
  - **Responsabilidad:** Cerrar sesión, limpiar localStorage/sessionStorage

### Flujo de Secuencia Principal (Consultar Logs)
```
ActivityLog.js → Seleccionar filtros (módulo, usuario, rango de fechas)
                      ↓
                activityLogService.getActivityLogsByModule(module)
                      ↓
                GET /activity-log/module/:module → Backend
                      ↓
                Backend filtra logs por módulo
                      ↓
                Respuesta: array de logs
                      ↓
                ActivityLog.js renderiza tabla con resultados
```

---

## 10. Componentes de Layout y UI

### Descripción
Componentes reutilizables de layout y UI.

### Archivos de Lógica

#### Layouts
- **Admin.js:** `R.D.-argon-dashboard-chakra-main/src/layouts/Admin.js`
  - **Responsabilidad:** Layout principal con Sidebar, AdminNavbar, Footer

- **Auth.js:** `R.D.-argon-dashboard-chakra-main/src/layouts/Auth.js`
  - **Responsabilidad:** Layout para páginas de autenticación

#### Navigation
- **Sidebar.js:** `R.D.-argon-dashboard-chakra-main/src/components/Sidebar/Sidebar.js`
  - **Responsabilidad:** Barra lateral de navegación con menús colapsables
  - **Filtrado:** Usa usePermissions para mostrar solo rutas permitidas

- **AdminNavbar.js:** `R.D.-argon-dashboard-chakra-main/src/components/Navbars/AdminNavbar.js`
  - **Responsabilidad:** Barra de navegación superior con búsqueda, notificaciones, perfil

- **AdminNavbarLinks.js:** `R.D.-argon-dashboard-chakra-main/src/components/Navbars/AdminNavbarLinks.js`
  - **Responsabilidad:** Links de navegación del navbar

#### Card Components
- **Card.js:** `R.D.-argon-dashboard-chakra-main/src/components/Card/Card.js`
  - **Responsabilidad:** Contenedor de tarjeta reutilizable

- **CardHeader.js:** `R.D.-argon-dashboard-chakra-main/src/components/Card/CardHeader.js`
  - **Responsabilidad:** Encabezado de tarjeta

- **CardBody.js:** `R.D.-argon-dashboard-chakra-main/src/components/Card/CardBody.js`
  - **Responsabilidad:** Cuerpo de tarjeta

#### Layout Wrappers
- **MainPanel.js:** `R.D.-argon-dashboard-chakra-main/src/components/Layout/MainPanel.js`
  - **Responsabilidad:** Panel principal de contenido

- **PanelContainer.js:** `R.D.-argon-dashboard-chakra-main/src/components/Layout/PanelContainer.js`
  - **Responsabilidad:** Contenedor con padding

- **PanelContent.js:** `R.D.-argon-dashboard-chakra-main/src/components/Layout/PanelContent.js`
  - **Responsabilidad:** Contenido con scroll

---

## Archivos Transversales

### Configuración de API
- **api.js:** `R.D.-argon-dashboard-chakra-main/src/services/api.js`
  - **Responsabilidad:** Instancia de Axios con interceptores
  - **Request Interceptor:** Agrega Bearer token automáticamente
  - **Response Interceptor:** Maneja 401 y redirecciona a login

### Rutas
- **routes.js:** `R.D.-argon-dashboard-chakra-main/src/routes.js`
  - **Responsabilidad:** Definición de 39 rutas con iconos, layouts, categorías

### Entry Point
- **index.js:** `R.D.-argon-dashboard-chakra-main/src/index.js`
  - **Responsabilidad:** Punto de entrada, configuración de HashRouter, ChakraProvider, AuthContext

### Theme
- **theme.js:** `R.D.-argon-dashboard-chakra-main/src/theme/theme.js`
  - **Responsabilidad:** Configuración del tema de Chakra UI
  - **Foundations:** breakpoints, colors
  - **Components:** overrides de button, badge, link, input
  - **Additions:** Card, MainPanel, PanelContent, PanelContainer

---

## Cómo usar este documento para Diagramas de Secuencia

Para crear un diagrama de secuencia de cualquier funcionalidad:

1. **Identifica la funcionalidad** que quieres diagramar
2. **Comienza en la View** (página del usuario)
3. **Sigue al Service** (llamada API)
4. **Identifica interceptores** (api.js, AuthContext)
5. **Revisa el Backend** (endpoint correspondiente)
6. **Verifica actualizaciones de estado** (useState, useEffect)

### Ejemplo: Diagrama de Secuencia para "Crear Producto"

```
Usuario → RegisterProduct.js (formulario)
                ↓
          Validar campos (nombre, precio, categoría, stock)
                ↓
          productService.createProduct(productData)
                ↓
          api.js Request Interceptor → Agrega Bearer token
                ↓
          POST /products → Backend
                ↓
          Backend: ProductsService.create()
                ↓
          Backend: generateProductCode() → PROD-20251022-0001
                ↓
          Backend: CategoriesService.findOne() → Validar categoría
                ↓
          Backend: ProductRepository.save()
                ↓
          Backend: ActivityLogService.create() → Registrar auditoría
                ↓
          Respuesta: { message, product }
                ↓
          RegisterProduct.js → useState actualiza
                ↓
          Notificación de éxito (Toast/SweetAlert)
                ↓
          Redirige a /admin/list-products
```

### Herramientas Recomendadas para Diagramas
- **PlantUML** - Diagramas como código
- **Mermaid** - Diagramas en Markdown
- **Draw.io / Lucidchart** - Herramientas visuales
- **Sequence Diagram** - https://sequencediagram.org/

---

## Notas Importantes

- Todos los componentes protegidos usan **AuthContext** para verificar autenticación
- Las rutas usan **usePermissions** para filtrado basado en permisos
- Los servicios usan **api.js** con interceptores de Axios
- Las páginas usan **React Hooks** (useState, useEffect, useContext)
- Los formularios usan **Chakra UI** components para validación
- Las notificaciones usan **SweetAlert** para feedback al usuario

---

**Última actualización:** 2025-10-22
