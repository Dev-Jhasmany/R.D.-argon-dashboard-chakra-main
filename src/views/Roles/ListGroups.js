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
import groupService from "services/groupService";

function ListGroups() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const cancelRef = React.useRef();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    const result = await groupService.getAllGroups();
    if (result.success) {
      setGroups(result.data);
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
    const result = await groupService.deleteGroup(deleteId);
    if (result.success) {
      toast({
        title: "Grupo eliminado",
        description: "El grupo ha sido eliminado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadGroups();
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
              Lista de Grupos
            </Text>
            <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
              {groups.length} grupos
            </Badge>
          </Flex>
        </CardHeader>
        <CardBody>
          {groups.length === 0 ? (
            <Center h="200px">
              <Text fontSize="lg" color="gray.500">
                No hay grupos registrados
              </Text>
            </Center>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>Grupo</Th>
                  <Th borderColor={borderColor} color='gray.400'>Descripción</Th>
                  <Th borderColor={borderColor} color='gray.400'>Fecha Creación</Th>
                  <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {groups.map((group) => (
                  <Tr key={group.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>{group.name}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{group.description || "Sin descripción"}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>
                        {group.createdAt ? new Date(group.createdAt).toLocaleDateString('es-BO') : 'N/A'}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Button size='sm' variant='outline' colorScheme='blue' me='5px'>
                        Editar
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        colorScheme='red'
                        onClick={() => openDeleteDialog(group.id)}
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
              Eliminar Grupo
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

export default ListGroups;
