import React from "react";
import {
  Avatar,
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

function ListSuppliers() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const suppliers = [
    {
      id: 1,
      name: "Tech Solutions S.A.",
      ruc: "20123456789",
      phone: "+591 12345678",
      email: "ventas@techsolutions.com",
      status: "Activo"
    },
    {
      id: 2,
      name: "Import Electronics",
      ruc: "20987654321",
      phone: "+591 87654321",
      email: "contacto@importelec.com",
      status: "Activo"
    },
    {
      id: 3,
      name: "Global Supplies",
      ruc: "20555666777",
      phone: "+591 55566677",
      email: "info@globalsupplies.com",
      status: "Inactivo"
    },
  ];

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Lista de Proveedores
          </Text>
        </CardHeader>
        <CardBody>
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th borderColor={borderColor} color='gray.400'>Proveedor</Th>
                <Th borderColor={borderColor} color='gray.400'>RUC/NIT</Th>
                <Th borderColor={borderColor} color='gray.400'>Teléfono</Th>
                <Th borderColor={borderColor} color='gray.400'>Email</Th>
                <Th borderColor={borderColor} color='gray.400'>Estado</Th>
                <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {suppliers.map((supplier) => (
                <Tr key={supplier.id}>
                  <Td borderColor={borderColor}>
                    <Flex align='center'>
                      <Avatar size='sm' name={supplier.name} me='10px' />
                      <Text fontSize='sm' fontWeight='bold'>{supplier.name}</Text>
                    </Flex>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{supplier.ruc}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{supplier.phone}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{supplier.email}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Badge
                      colorScheme={supplier.status === "Activo" ? "green" : "red"}
                      fontSize='sm'
                      p='3px 10px'
                      borderRadius='8px'>
                      {supplier.status}
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

export default ListSuppliers;
