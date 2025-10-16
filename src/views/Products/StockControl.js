import React from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function StockControl() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const iconBlue = useColorModeValue("blue.500", "blue.500");

  const stockData = [
    { id: 1, product: "Laptop HP", current: 15, min: 10, max: 50, percentage: 30 },
    { id: 2, product: "Mouse Logitech", current: 45, min: 20, max: 100, percentage: 45 },
    { id: 3, product: "Teclado Mecánico", current: 3, min: 10, max: 30, percentage: 10 },
    { id: 4, product: "Monitor LG 24", current: 0, min: 5, max: 25, percentage: 0 },
  ];

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Grid templateColumns={{ sm: "1fr", lg: "repeat(3, 1fr)" }} gap='22px' mb='24px'>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontSize='sm' color='gray.400' fontWeight='bold' mb='5px'>
                Total Productos
              </StatLabel>
              <StatNumber fontSize='2xl' color={textColor} fontWeight='bold'>
                124
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontSize='sm' color='orange.400' fontWeight='bold' mb='5px'>
                Bajo Stock
              </StatLabel>
              <StatNumber fontSize='2xl' color='orange.400' fontWeight='bold'>
                8
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel fontSize='sm' color='red.400' fontWeight='bold' mb='5px'>
                Agotados
              </StatLabel>
              <StatNumber fontSize='2xl' color='red.400' fontWeight='bold'>
                3
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Control de Stock
          </Text>
        </CardHeader>
        <CardBody>
          <Table variant='simple' color={textColor}>
            <Thead>
              <Tr>
                <Th borderColor={borderColor} color='gray.400'>Producto</Th>
                <Th borderColor={borderColor} color='gray.400'>Stock Actual</Th>
                <Th borderColor={borderColor} color='gray.400'>Stock Mínimo</Th>
                <Th borderColor={borderColor} color='gray.400'>Stock Máximo</Th>
                <Th borderColor={borderColor} color='gray.400'>Nivel</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stockData.map((item) => (
                <Tr key={item.id}>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm' fontWeight='bold'>{item.product}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm' fontWeight='bold'>{item.current}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{item.min}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Text fontSize='sm'>{item.max}</Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Flex align='center'>
                      <Progress
                        value={item.percentage}
                        colorScheme={
                          item.percentage === 0 ? "red" :
                          item.percentage < 30 ? "orange" : "green"
                        }
                        size='sm'
                        borderRadius='15px'
                        w='100px'
                        me='10px'
                      />
                      <Text fontSize='sm'>{item.percentage}%</Text>
                    </Flex>
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

export default StockControl;
