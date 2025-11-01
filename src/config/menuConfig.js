// Configuración de menús y categorías
// Este archivo define la estructura de menús sin importar componentes
// para evitar dependencias circulares

export const MENU_STRUCTURE = [
  {
    id: "users",
    name: "Usuarios",
    category: "users",
    submenus: ["Registrar Usuario", "Listar Usuarios", "Cambiar Contraseña", "Mi Perfil"]
  },
  {
    id: "roles",
    name: "Roles y Permisos",
    category: "roles",
    submenus: ["Registrar Rol", "Listar Roles", "Registrar Permiso", "Listar Permisos"]
  },
  {
    id: "products",
    name: "Productos e Inventario",
    category: "products",
    submenus: ["Registrar Producto", "Listar Productos", "Registrar Categorías", "Controlar Stock"]
  },
  {
    id: "supplies",
    name: "Insumos",
    category: "supplies",
    submenus: ["Entradas de Insumos", "Reporte Desperdicios"]
  },
  {
    id: "promotions",
    name: "Promociones",
    category: "promotions",
    submenus: ["Registrar Promoción", "Listar Promociones"]
  },
  {
    id: "suppliers",
    name: "Proveedores",
    category: "suppliers",
    submenus: ["Registrar Proveedor", "Listar Proveedores"]
  },
  {
    id: "sales",
    name: "Gestión de Ventas",
    category: "sales",
    submenus: ["Registrar Venta", "Listar Ventas"]
  },
  {
    id: "cash_audit",
    name: "Arqueo de caja",
    category: "cash_audit",
    submenus: ["Control de Caja", "Devoluciones y Anulaciones"]
  },
  {
    id: "orders",
    name: "Pedidos",
    category: "orders",
    submenus: ["Ver Pedidos", "Administrar Pedidos", "Historial de Pedidos"]
  },
  {
    id: "activity_log",
    name: "Bitácora",
    category: "activity_log",
    submenus: ["Ver Bitácora"]
  },
];

// Categorías y menús que siempre son visibles para todos los usuarios
export const ALWAYS_VISIBLE_CATEGORIES = ["Dashboard", "Configuración"];

// Función helper para obtener el mapeo de nombres a IDs
export const getCategoryMap = () => {
  const map = {};
  MENU_STRUCTURE.forEach(menu => {
    map[menu.name] = menu.category;
  });
  return map;
};

// Función helper para obtener las categorías para el componente de permisos
export const getMenuCategories = () => {
  return MENU_STRUCTURE
    .filter(menu => menu.category !== 'settings') // Excluir configuración
    .map(menu => ({
      id: menu.category,
      name: menu.name,
      submenus: menu.submenus
    }));
};

// Función helper para obtener categorías para ListPermissions
export const getMenuCategoriesForList = () => {
  return MENU_STRUCTURE.map(menu => ({
    value: menu.category,
    label: menu.name
  }));
};

// Función helper para obtener submenús disponibles por categoría
export const getAvailableSubmenus = () => {
  const submenus = {};
  MENU_STRUCTURE.forEach(menu => {
    submenus[menu.category] = menu.submenus;
  });
  return submenus;
};
