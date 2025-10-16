import React from "react";
import {
  Box,
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
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function ListUsers() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Datos de ejemplo
  const users = [
    {
      id: 1,
      name: "Juan Pérez",
      email: "juan@email.com",
      role: "Administrador",
      status: "Activo",
    },
    {
      id: 2,
      name: "María García",
      email: "maria@email.com",
      role: "Usuario",
      status: "Activo",
    },
    {
      id: 3,
      name: "Carlos López",
      email: "carlos@email.com",
      role: "Usuario",
      status: "Inactivo",
    },
  ];

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Lista de Usuarios
          </Text>
        </CardHeader>
        <CardBody>
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
                      <Avatar size='sm' name={user.name} me='10px' />
                      <Text fontSize='sm' fontWeight='bold'>
                        {user.name}
                      </Text>
                    </Flex>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{user.email}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{user.role}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Badge
                      colorScheme={user.status === "Activo" ? "green" : "red"}
                      fontSize='sm'
                      p='3px 10px'
                      borderRadius='8px'>
                      {user.status}
                    </Badge>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Button size='sm' variant='outline' colorScheme='blue' me='5px'>
                      Editar
                    </Button>
                    <Button size='sm' variant='outline' colorScheme='red'>
                      Eliminar
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default ListUsers;
