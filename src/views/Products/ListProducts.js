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

function ListProducts() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const products = [
    { id: 1, name: "Laptop HP", sku: "LAP-001", price: 850.00, stock: 15, status: "Disponible" },
    { id: 2, name: "Mouse Logitech", sku: "MOU-002", price: 25.00, stock: 45, status: "Disponible" },
    { id: 3, name: "Teclado Mecánico", sku: "TEC-003", price: 75.00, stock: 3, status: "Bajo Stock" },
    { id: 4, name: "Monitor LG 24", sku: "MON-004", price: 180.00, stock: 0, status: "Agotado" },
  ];

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Lista de Productos
          </Text>
        </CardHeader>
        <CardBody>
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th borderColor={borderColor} color='gray.400'>Producto</Th>
                <Th borderColor={borderColor} color='gray.400'>SKU</Th>
                <Th borderColor={borderColor} color='gray.400'>Precio</Th>
                <Th borderColor={borderColor} color='gray.400'>Stock</Th>
                <Th borderColor={borderColor} color='gray.400'>Estado</Th>
                <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {products.map((product) => (
                <Tr key={product.id}>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm' fontWeight='bold'>{product.name}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{product.sku}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm' fontWeight='bold'>${product.price}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{product.stock}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Badge
                      colorScheme={
                        product.status === "Disponible" ? "green" :
                        product.status === "Bajo Stock" ? "orange" : "red"
                      }
                      fontSize='sm'
                      p='3px 10px'
                      borderRadius='8px'>
                      {product.status}
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

export default ListProducts;
