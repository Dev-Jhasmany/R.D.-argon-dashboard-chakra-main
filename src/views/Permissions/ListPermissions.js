import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Badge,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Checkbox,
  Stack,
  Box,
  Collapse,
  Icon,
  VStack,
  HStack,
  Divider,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import permissionService from "services/permissionService";
import roleService from "services/roleService";
import { getMenuCategoriesForList, getAvailableSubmenus } from "config/menuConfig";

function ListPermissions() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const roleHeaderBg = useColorModeValue("gray.50", "gray.700");
  const roleHeaderHoverBg = useColorModeValue("gray.100", "gray.600");
  const categoryCardBg = useColorModeValue("white", "gray.800");
  const submenuBoxBg = useColorModeValue("gray.50", "gray.700");
  const toast = useToast();

  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [editForm, setEditForm] = useState({
    roleId: '',
    menuCategory: '',
    submenus: [],
    description: '',
  });
  const [expandedRoles, setExpandedRoles] = useState({});
  const cancelRef = React.useRef();

  // Opciones disponibles de categorías - Obtenidas desde configuración centralizada
  const menuCategories = getMenuCategoriesForList();

  // Submenús disponibles por categoría - Obtenidos desde configuración centralizada
  const availableSubmenus = getAvailableSubmenus();

  useEffect(() => {
    loadPermissions();
    loadRoles();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    const result = await permissionService.getAllPermissions();
    if (result.success) {
      setPermissions(result.data);
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const result = await permissionService.deletePermission(deleteId);
    if (result.success) {
      toast({
        title: "Permiso eliminado",
        description: "Los cambios se aplicarán automáticamente en máximo 5 minutos. Los usuarios afectados pueden cerrar sesión y volver a entrar para ver los cambios inmediatamente.",
        status: "success",
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });
      loadPermissions();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
    setIsDeleteOpen(false);
    setDeleteId(null);
  };

  const openDeleteDialog = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const loadRoles = async () => {
    const result = await roleService.getAllRoles();
    if (result.success) {
      setRoles(result.data);
    }
  };

  const openEditDialog = (permission) => {
    setEditingPermission(permission);
    setEditForm({
      roleId: permission.role?.id || '',
      menuCategory: permission.menuCategory,
      submenus: permission.submenus || [],
      description: permission.description || '',
    });
    setIsEditOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditOpen(false);
    setEditingPermission(null);
    setEditForm({
      roleId: '',
      menuCategory: '',
      submenus: [],
      description: '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleSubmenuToggle = (submenu) => {
    const currentSubmenus = editForm.submenus || [];
    const newSubmenus = currentSubmenus.includes(submenu)
      ? currentSubmenus.filter(s => s !== submenu)
      : [...currentSubmenus, submenu];

    setEditForm({
      ...editForm,
      submenus: newSubmenus,
    });
  };

  const handleEditSubmit = async () => {
    // Validaciones básicas
    if (!editForm.roleId) {
      toast({
        title: 'Campo requerido',
        description: 'Debe seleccionar un rol',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (!editForm.menuCategory) {
      toast({
        title: 'Campo requerido',
        description: 'Debe seleccionar una categoría de menú',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    // Preparar datos para actualizar
    const updateData = {
      roleId: editForm.roleId,
      menuCategory: editForm.menuCategory,
      submenus: editForm.submenus,
      description: editForm.description,
    };

    const result = await permissionService.updatePermission(editingPermission.id, updateData);

    if (result.success) {
      toast({
        title: 'Permiso actualizado',
        description: 'Los cambios se aplicarán automáticamente en máximo 5 minutos. Los usuarios afectados pueden cerrar sesión y volver a entrar para ver los cambios inmediatamente.',
        status: 'success',
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });
      loadPermissions();
      closeEditDialog();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      users: 'Usuarios',
      roles: 'Roles y Permisos',
      products: 'Productos e Inventario',
      promotions: 'Promociones',
      suppliers: 'Proveedores',
      sales: 'Gestión de Ventas',
      payments: 'Pagos',
      settings: 'Configuración'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      users: 'purple',
      roles: 'blue',
      products: 'green',
      promotions: 'orange',
      suppliers: 'cyan',
      sales: 'teal',
      payments: 'pink',
      settings: 'gray'
    };
    return colors[category] || 'gray';
  };

  // Agrupar permisos por rol
  const groupPermissionsByRole = () => {
    const grouped = {};

    permissions.forEach(permission => {
      const roleId = permission.role?.id;
      const roleName = permission.role?.name || 'Sin rol';

      if (!grouped[roleId]) {
        grouped[roleId] = {
          role: permission.role,
          categories: {}
        };
      }

      const category = permission.menuCategory;
      if (!grouped[roleId].categories[category]) {
        grouped[roleId].categories[category] = [];
      }

      grouped[roleId].categories[category].push(permission);
    });

    return Object.values(grouped);
  };

  const toggleRoleExpansion = (roleId) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const getSubmenuLabel = (submenu) => {
    const labels = {
      list: 'Listar',
      create: 'Registrar',
      edit: 'Editar',
      delete: 'Eliminar',
      view: 'Ver',
      permissions: 'Permisos',
      stock: 'Stock',
      categories: 'Categorías',
      active: 'Activar',
      reports: 'Reportes',
      general: 'General',
      users: 'Usuarios',
      system: 'Sistema',
      security: 'Seguridad'
    };
    return labels[submenu] || submenu;
  };

  if (loading) {
    return (
      <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Spinner size="xl" color="teal.300" />
        </Center>
      </Flex>
    );
  }

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Flex justify='space-between' align='center'>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Lista de Permisos
            </Text>
            <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
              {permissions.length} permisos
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {permissions.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay permisos registrados
              </Text>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {groupPermissionsByRole().map((roleGroup, roleIndex) => {
                const roleId = roleGroup.role?.id;
                const isExpanded = expandedRoles[roleId];

                return (
                  <Box
                    key={roleId || roleIndex}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="lg"
                    overflow="hidden"
                  >
                    {/* Header del rol - clickeable para expandir/colapsar */}
                    <Flex
                      p={4}
                      bg={roleHeaderBg}
                      cursor="pointer"
                      onClick={() => toggleRoleExpansion(roleId)}
                      justify="space-between"
                      align="center"
                      _hover={{ bg: roleHeaderHoverBg }}
                    >
                      <HStack spacing={4}>
                        <Icon
                          as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                          w={6}
                          h={6}
                          color="teal.500"
                        />
                        <Box>
                          <Text fontSize="lg" fontWeight="bold" color={textColor}>
                            {roleGroup.role?.name || 'Sin rol'}
                          </Text>
                          <Badge colorScheme='gray' fontSize='sm' mt={1}>
                            Nivel {roleGroup.role?.hierarchyLevel || 'N/A'}
                          </Badge>
                        </Box>
                      </HStack>
                      <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="md">
                        {Object.keys(roleGroup.categories).length} módulos
                      </Badge>
                    </Flex>

                    {/* Contenido expandible con los permisos agrupados por categoría */}
                    <Collapse in={isExpanded} animateOpacity>
                      <Box p={4}>
                        <VStack spacing={4} align="stretch">
                          {Object.entries(roleGroup.categories).map(([category, categoryPermissions]) => (
                            <Box
                              key={category}
                              p={4}
                              borderWidth="1px"
                              borderColor={borderColor}
                              borderRadius="md"
                              bg={categoryCardBg}
                            >
                              <HStack justify="space-between" mb={3}>
                                <HStack>
                                  <Badge
                                    colorScheme={getCategoryColor(category)}
                                    fontSize='sm'
                                    p='4px 12px'
                                    borderRadius='8px'
                                  >
                                    {getCategoryLabel(category)}
                                  </Badge>
                                  <Text fontSize="sm" color="gray.500">
                                    ({categoryPermissions.length} permiso{categoryPermissions.length > 1 ? 's' : ''})
                                  </Text>
                                </HStack>
                              </HStack>

                              <Divider mb={3} />

                              {/* Submenús del permiso */}
                              <VStack spacing={3} align="stretch">
                                {categoryPermissions.map((permission) => (
                                  <Box key={permission.id}>
                                    <Flex justify="space-between" align="start">
                                      <Box flex="1">
                                        <Flex wrap='wrap' gap={2} mb={2}>
                                          {permission.submenus && permission.submenus.length > 0 ? (
                                            permission.submenus.map((submenu, idx) => (
                                              <Badge
                                                key={idx}
                                                colorScheme='teal'
                                                fontSize='sm'
                                                p='4px 10px'
                                                borderRadius='6px'
                                              >
                                                {getSubmenuLabel(submenu)}
                                              </Badge>
                                            ))
                                          ) : (
                                            <Text fontSize='sm' color='gray.500'>Sin submenús</Text>
                                          )}
                                        </Flex>
                                        {permission.description && (
                                          <Text fontSize='sm' color='gray.600' fontStyle="italic">
                                            {permission.description}
                                          </Text>
                                        )}
                                      </Box>

                                      <HStack spacing={2} ml={4}>
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          colorScheme='blue'
                                          onClick={() => openEditDialog(permission)}
                                        >
                                          Editar
                                        </Button>
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          colorScheme='red'
                                          onClick={() => openDeleteDialog(permission.id)}
                                        >
                                          Eliminar
                                        </Button>
                                      </HStack>
                                    </Flex>
                                    {categoryPermissions.indexOf(permission) < categoryPermissions.length - 1 && (
                                      <Divider mt={3} />
                                    )}
                                  </Box>
                                ))}
                              </VStack>

                              {/* Descripción general si existe */}
                              {categoryPermissions[0]?.description && (
                                <Box mt={3} p={2} bg={submenuBoxBg} borderRadius="md">
                                  <Text fontSize='xs' color='gray.600'>
                                    <strong>Permisos de {category}</strong> para el rol {roleGroup.role?.name}
                                  </Text>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Alert Dialog para confirmar eliminación */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Eliminar Permiso
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro? Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme='red' onClick={handleDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal para editar permiso */}
      <Modal isOpen={isEditOpen} onClose={closeEditDialog} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar Permiso</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4} isRequired>
              <FormLabel>Rol</FormLabel>
              <Select
                name='roleId'
                value={editForm.roleId}
                onChange={handleEditChange}
                placeholder='Seleccionar rol'
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} - Nivel {role.hierarchyLevel}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={4} isRequired>
              <FormLabel>Categoría de Menú</FormLabel>
              <Select
                name='menuCategory'
                value={editForm.menuCategory}
                onChange={handleEditChange}
                placeholder='Seleccionar categoría'
              >
                {menuCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Submenús Permitidos</FormLabel>
              <Stack spacing={2} mt={2}>
                {editForm.menuCategory && availableSubmenus[editForm.menuCategory]?.map((submenu) => (
                  <Checkbox
                    key={submenu}
                    isChecked={editForm.submenus.includes(submenu)}
                    onChange={() => handleSubmenuToggle(submenu)}
                  >
                    {submenu}
                  </Checkbox>
                ))}
                {!editForm.menuCategory && (
                  <Text fontSize='sm' color='gray.500'>
                    Primero seleccione una categoría de menú
                  </Text>
                )}
              </Stack>
            </FormControl>

            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Textarea
                name='description'
                value={editForm.description}
                onChange={handleEditChange}
                placeholder='Descripción del permiso'
                rows={3}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={closeEditDialog} mr={3}>
              Cancelar
            </Button>
            <Button colorScheme='blue' onClick={handleEditSubmit}>
              Guardar Cambios
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default ListPermissions;
