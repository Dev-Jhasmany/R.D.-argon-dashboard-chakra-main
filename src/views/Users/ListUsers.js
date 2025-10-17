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
  Avatar,
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
import userService from "services/userService";

function ListUsers() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const cancelRef = React.useRef();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const result = await userService.getAllUsers();
    if (result.success) {
      setUsers(result.data);
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
    const result = await userService.deleteUser(deleteId);
    if (result.success) {
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadUsers();
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
              Lista de Usuarios
            </Text>
            <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
              {users.length} usuarios
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {users.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay usuarios registrados
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>
                    Usuario
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Email
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    CI
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Nombres Completos
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Rol
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Estado
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Acciones
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => (
                  <Tr key={user.id}>
                    <Td borderColor={borderColor}>
                      <Flex align='center'>
                        <Avatar
                          size='sm'
                          name={`${user.full_name || ''} ${user.full_last_name || ''}`}
                          me='10px'
                        />
                        <Text fontSize='sm' fontWeight='bold'>
                          {user.username}
                        </Text>
                      </Flex>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{user.email}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{user.ci || 'N/A'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>
                        {user.full_name && user.full_last_name
                          ? `${user.full_name} ${user.full_last_name}`
                          : 'N/A'
                        }
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      {user.role ? (
                        <Flex direction='column'>
                          <Text fontSize='sm' fontWeight='bold'>
                            {user.role.name}
                          </Text>
                          <Badge colorScheme='purple' fontSize='xs' mt={1} w='fit-content'>
                            Nivel {user.role.hierarchyLevel}
                          </Badge>
                        </Flex>
                      ) : (
                        <Text fontSize='sm' color='gray.500'>Sin rol</Text>
                      )}
                    </Td>
                    <Td borderColor={borderColor}>
                      <Badge
                        colorScheme={user.is_active ? "green" : "red"}
                        fontSize='sm'
                        p='3px 10px'
                        borderRadius='8px'>
                        {user.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </Td>
                    <Td borderColor={borderColor}>
                      {user.email === 'jhasmany@admin.com' ? (
                        <Badge colorScheme='gray' fontSize='xs' p='4px 8px' borderRadius='6px'>
                          Protegido
                        </Badge>
                      ) : (
                        <>
                          <Button size='sm' variant='outline' colorScheme='blue' me='5px'>
                            Editar
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            colorScheme='red'
                            onClick={() => openDeleteDialog(user.id)}
                          >
                            Eliminar
                          </Button>
                        </>
                      )}
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
              Eliminar Usuario
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

export default ListUsers;
