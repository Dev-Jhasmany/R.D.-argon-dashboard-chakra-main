import React from "react";
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
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function ListRoles() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const roles = [
    { id: 1, name: "Administrador", description: "Acceso total al sistema", users: 3 },
    { id: 2, name: "Vendedor", description: "Gestión de ventas y clientes", users: 8 },
    { id: 3, name: "Almacenero", description: "Control de inventario", users: 5 },
  ];

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Lista de Roles
          </Text>
        </CardHeader>
        <CardBody>
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th borderColor={borderColor} color='gray.400'>Rol</Th>
                <Th borderColor={borderColor} color='gray.400'>Descripción</Th>
                <Th borderColor={borderColor} color='gray.400'>Usuarios</Th>
                <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {roles.map((role) => (
                <Tr key={role.id}>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm' fontWeight='bold'>{role.name}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{role.description}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Badge colorScheme='blue' fontSize='sm' p='3px 10px' borderRadius='8px'>
                      {role.users}
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

export default ListRoles;
