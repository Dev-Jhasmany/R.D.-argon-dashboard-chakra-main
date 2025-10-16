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

function ListGroups() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const groups = [
    { id: 1, name: "Ventas", description: "Equipo de ventas", members: 12 },
    { id: 2, name: "Almacén", description: "Gestión de inventario", members: 6 },
    { id: 3, name: "Administración", description: "Personal administrativo", members: 4 },
  ];

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Lista de Grupos
          </Text>
        </CardHeader>
        <CardBody>
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th borderColor={borderColor} color='gray.400'>Grupo</Th>
                <Th borderColor={borderColor} color='gray.400'>Descripción</Th>
                <Th borderColor={borderColor} color='gray.400'>Miembros</Th>
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
                    <Text fontSize='sm'>{group.description}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Badge colorScheme='green' fontSize='sm' p='3px 10px' borderRadius='8px'>
                      {group.members}
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

export default ListGroups;
