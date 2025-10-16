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

function ListPromotions() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const promotions = [
    {
      id: 1,
      name: "Descuento de Verano",
      discount: "20%",
      start: "2024-01-01",
      end: "2024-02-28",
      status: "Activa"
    },
    {
      id: 2,
      name: "Black Friday",
      discount: "50%",
      start: "2024-11-25",
      end: "2024-11-27",
      status: "Programada"
    },
    {
      id: 3,
      name: "Cyber Monday",
      discount: "30%",
      start: "2023-11-28",
      end: "2023-11-28",
      status: "Finalizada"
    },
  ];

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Lista de Promociones
          </Text>
        </CardHeader>
        <CardBody>
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th borderColor={borderColor} color='gray.400'>Promoción</Th>
                <Th borderColor={borderColor} color='gray.400'>Descuento</Th>
                <Th borderColor={borderColor} color='gray.400'>Fecha Inicio</Th>
                <Th borderColor={borderColor} color='gray.400'>Fecha Fin</Th>
                <Th borderColor={borderColor} color='gray.400'>Estado</Th>
                <Th borderColor={borderColor} color='gray.400'>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {promotions.map((promo) => (
                <Tr key={promo.id}>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm' fontWeight='bold'>{promo.name}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm' fontWeight='bold' color='green.400'>
                      {promo.discount}
                    </Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{promo.start}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{promo.end}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Badge
                      colorScheme={
                        promo.status === "Activa" ? "green" :
                        promo.status === "Programada" ? "blue" : "gray"
                      }
                      fontSize='sm'
                      p='3px 10px'
                      borderRadius='8px'>
                      {promo.status}
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

export default ListPromotions;
