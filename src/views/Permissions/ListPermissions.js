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
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import permissionService from "services/permissionService";

function ListPermissions() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const cancelRef = React.useRef();

  useEffect(() => {
    loadPermissions();
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
      });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const result = await permissionService.deletePermission(deleteId);
    if (result.success) {
      toast({
        title: "Permiso eliminado",
        description: "El permiso ha sido eliminado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadPermissions();
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsDeleteOpen(false);
    setDeleteId(null);
  };

  const openDeleteDialog = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      users: 'Usuarios',
      roles: 'Roles y Permisos',
      products: 'Productos e Inventario',
      promotions: 'Promociones',
      suppliers: 'Proveedores',
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
      payments: 'pink',
      settings: 'gray'
    };
    return colors[category] || 'gray';
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
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>Rol</Th>
                  <Th borderColor={borderColor} color='gray.400'>Categoría de Menú</Th>
                  <Th borderColor={borderColor} color='gray.400'>Submenús Permitidos</Th>
                  <Th borderColor={borderColor} color='gray.400'>Descripción</Th>
                  <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {permissions.map((permission) => (
                  <Tr key={permission.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>
                        {permission.role?.name || 'Sin rol'}
                      </Text>
                      <Badge colorScheme='gray' fontSize='xs' mt={1}>
                        Nivel {permission.role?.hierarchyLevel || 'N/A'}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={getCategoryColor(permission.menuCategory)}
                        fontSize='sm'
                        p='3px 10px'
                        borderRadius='8px'
                      >
                        {getCategoryLabel(permission.menuCategory)}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Flex wrap='wrap' gap={1}>
                        {permission.submenus && permission.submenus.length > 0 ? (
                          permission.submenus.map((submenu, idx) => (
                            <Badge
                              key={idx}
                              colorScheme='teal'
                              fontSize='xs'
                              p='2px 8px'
                              borderRadius='6px'
                              mb={1}
                            >
                              {submenu}
                            </Badge>
                          ))
                        ) : (
                          <Text fontSize='xs' color='gray.500'>Sin submenús</Text>
                        )}
                      </Flex>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{permission.description || "Sin descripción"}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Button size='sm' variant='outline' colorScheme='blue' me='5px'>
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
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
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
    </Flex>
  );
}

export default ListPermissions;
