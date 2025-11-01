import React, { useState, useEffect } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Text,
  Textarea,
  useColorModeValue,
  useToast,
  Select,
  Box,
  Checkbox,
  VStack,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import permissionService from "services/permissionService";
import roleService from "services/roleService";
import { getMenuCategories } from "config/menuConfig";

// Obtener las categorías de menú desde la configuración centralizada
// NOTA: Dashboard y Configuración son siempre visibles para todos, no se incluyen aquí
const MENU_CATEGORIES = getMenuCategories();

function RegisterPermission() {
  const textColor = useColorModeValue("gray.700", "white");
  const toast = useToast();

  const [formData, setFormData] = useState({
    selectedCategories: {}, // {users: ["Registrar Usuario", "Listar Usuarios"], products: [...]}
    roleId: "",
    description: "",
  });

  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoadingRoles(true);
    const result = await roleService.getAllRoles();
    if (result.success) {
      setRoles(result.data);
      if (result.data.length === 0) {
        toast({
          title: "Sin roles disponibles",
          description: "Debe registrar al menos un rol antes de crear permisos",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setLoadingRoles(false);
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const newCategories = { ...prev.selectedCategories };
      if (newCategories[categoryId]) {
        // Si ya existe, la removemos
        delete newCategories[categoryId];
      } else {
        // Si no existe, la agregamos con array vacío
        newCategories[categoryId] = [];
      }
      return {
        ...prev,
        selectedCategories: newCategories
      };
    });
  };

  const handleSubmenuChange = (categoryId, submenu) => {
    setFormData(prev => {
      const newCategories = { ...prev.selectedCategories };
      const categorySubmenus = newCategories[categoryId] || [];

      if (categorySubmenus.includes(submenu)) {
        // Remover submenu
        newCategories[categoryId] = categorySubmenus.filter(s => s !== submenu);
      } else {
        // Agregar submenu
        newCategories[categoryId] = [...categorySubmenus, submenu];
      }

      return {
        ...prev,
        selectedCategories: newCategories
      };
    });
  };

  const handleSelectAllInCategory = (categoryId) => {
    const category = MENU_CATEGORIES.find(cat => cat.id === categoryId);
    if (category) {
      setFormData(prev => ({
        ...prev,
        selectedCategories: {
          ...prev.selectedCategories,
          [categoryId]: [...category.submenus]
        }
      }));
    }
  };

  const handleDeselectAllInCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      selectedCategories: {
        ...prev.selectedCategories,
        [categoryId]: []
      }
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (roles.length === 0) {
      toast({
        title: "Error",
        description: "No hay roles disponibles. Debe registrar al menos un rol primero.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    if (Object.keys(formData.selectedCategories).length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos una categoría de menú",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    // Verificar que al menos una categoría tenga submenús seleccionados
    const hasSubmenus = Object.values(formData.selectedCategories).some(
      submenus => submenus.length > 0
    );

    if (!hasSubmenus) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un submenú en alguna categoría",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (!formData.roleId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un rol",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Crear un permiso por cada categoría seleccionada
    const promises = Object.entries(formData.selectedCategories)
      .filter(([_, submenus]) => submenus.length > 0)
      .map(([menuCategory, submenus]) =>
        permissionService.createPermission({
          menuCategory,
          submenus,
          roleId: formData.roleId,
          description: formData.description || `Permisos de ${menuCategory} para el rol`
        })
      );

    const results = await Promise.all(promises);
    setLoading(false);

    const allSuccess = results.every(r => r.success);

    if (allSuccess) {
      toast({
        title: "Permisos registrados",
        description: `Se registraron ${results.length} permisos correctamente`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Limpiar formulario
      setFormData({
        selectedCategories: {},
        roleId: "",
        description: "",
      });
    } else {
      const failedCount = results.filter(r => !r.success).length;
      toast({
        title: "Error parcial",
        description: `${failedCount} permisos no se pudieron registrar`,
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loadingRoles) {
    return (
      <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
        <Center h="400px">
          <Spinner size="xl" color="teal.300" />
          <Text ml={4}>Cargando roles...</Text>
        </Center>
      </Flex>
    );
  }

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' maxW='900px' mx='auto'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Permiso de Menú
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            {roles.length === 0 && (
              <Alert status="warning" mb="24px" borderRadius="8px">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  No hay roles disponibles. Por favor, registre al menos un rol antes de crear permisos.
                </AlertDescription>
              </Alert>
            )}

            {/* Selección de Rol */}
            <FormControl mb='24px' isRequired>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Rol
              </FormLabel>
              <Select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                borderRadius='15px'
                fontSize='sm'
                size='lg'
                placeholder='Seleccione un rol'
                isDisabled={roles.length === 0}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name} - Nivel {role.hierarchyLevel}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Checkboxes de Categorías de Menú */}
            <FormControl mb='24px' isRequired>
              <FormLabel ms='4px' fontSize='sm' fontWeight='bold' mb={3}>
                Categorías de Menú y Submenús Permitidos
              </FormLabel>
              <Text fontSize='xs' color='gray.500' mb={4}>
                Selecciona las categorías y marca los submenús que este rol puede acceder
              </Text>

              <VStack align="start" spacing={4} w="100%">
                {MENU_CATEGORIES.map((category) => {
                  const isCategorySelected = formData.selectedCategories.hasOwnProperty(category.id);
                  const selectedSubmenus = formData.selectedCategories[category.id] || [];

                  return (
                    <Box
                      key={category.id}
                      w="100%"
                      borderWidth="1px"
                      borderRadius="12px"
                      p={4}
                      bg={isCategorySelected ? useColorModeValue("blue.50", "blue.900") : useColorModeValue("white", "gray.800")}
                      borderColor={isCategorySelected ? "blue.300" : useColorModeValue("gray.200", "gray.600")}
                      transition="all 0.2s"
                    >
                      {/* Header de la categoría */}
                      <Flex justifyContent="space-between" alignItems="center" mb={isCategorySelected ? 3 : 0}>
                        <Checkbox
                          isChecked={isCategorySelected}
                          onChange={() => handleCategoryToggle(category.id)}
                          colorScheme="blue"
                          size="lg"
                          fontWeight="bold"
                        >
                          <Text fontSize="md" fontWeight="bold">
                            {category.name}
                          </Text>
                        </Checkbox>
                        {isCategorySelected && (
                          <Flex gap={2}>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="blue"
                              onClick={() => handleSelectAllInCategory(category.id)}
                            >
                              Todos
                            </Button>
                            <Button
                              size="xs"
                              variant="ghost"
                              colorScheme="gray"
                              onClick={() => handleDeselectAllInCategory(category.id)}
                            >
                              Ninguno
                            </Button>
                          </Flex>
                        )}
                      </Flex>

                      {/* Submenús (solo si la categoría está seleccionada) */}
                      {isCategorySelected && (
                        <Box ml={8} mt={3}>
                          <VStack align="start" spacing={2}>
                            {category.submenus.map((submenu) => (
                              <Checkbox
                                key={submenu}
                                isChecked={selectedSubmenus.includes(submenu)}
                                onChange={() => handleSubmenuChange(category.id, submenu)}
                                colorScheme="teal"
                                size="sm"
                              >
                                <Text fontSize="sm">{submenu}</Text>
                              </Checkbox>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            </FormControl>

            {/* Descripción */}
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Descripción (Opcional)
              </FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                borderRadius='15px'
                fontSize='sm'
                placeholder='Descripción del permiso'
                rows={4}
              />
            </FormControl>

            <Button
              onClick={handleSubmit}
              isLoading={loading}
              variant='dark'
              fontSize='sm'
              fontWeight='bold'
              w='200px'
              h='45px'
              mb='24px'>
              REGISTRAR PERMISO
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default RegisterPermission;
