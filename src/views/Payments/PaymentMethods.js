import React from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";
import { FaCreditCard, FaMoneyBillWave, FaMobileAlt, FaUniversity } from "react-icons/fa";

function PaymentMethods() {
  const textColor = useColorModeValue("gray.700", "white");
  const iconBlue = useColorModeValue("blue.500", "blue.500");
  const iconGreen = useColorModeValue("green.500", "green.500");
  const iconOrange = useColorModeValue("orange.500", "orange.500");
  const iconPurple = useColorModeValue("purple.500", "purple.500");

  const paymentMethods = [
    {
      id: 1,
      name: "Efectivo",
      icon: FaMoneyBillWave,
      color: iconGreen,
      description: "Pago en efectivo",
      enabled: true,
    },
    {
      id: 2,
      name: "Tarjeta de Crédito/Débito",
      icon: FaCreditCard,
      color: iconBlue,
      description: "Visa, Mastercard, etc.",
      enabled: true,
    },
    {
      id: 3,
      name: "Transferencia Bancaria",
      icon: FaUniversity,
      color: iconPurple,
      description: "Transferencia directa",
      enabled: true,
    },
    {
      id: 4,
      name: "Pago Móvil",
      icon: FaMobileAlt,
      color: iconOrange,
      description: "QR, billeteras digitales",
      enabled: false,
    },
  ];

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Métodos de Pago
          </Text>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ sm: "1fr", md: "repeat(2, 1fr)" }} gap='24px'>
            {paymentMethods.map((method) => (
              <Card key={method.id} p='20px'>
                <Flex direction='column'>
                  <Flex align='center' mb='18px'>
                    <Flex
                      align='center'
                      justify='center'
                      w='60px'
                      h='60px'
                      borderRadius='12px'
                      bg={method.color}
                      me='15px'>
                      <Icon as={method.icon} w='30px' h='30px' color='white' />
                    </Flex>
                    <Box>
                      <Text fontSize='lg' color={textColor} fontWeight='bold'>
                        {method.name}
                      </Text>
                      <Text fontSize='sm' color='gray.400'>
                        {method.description}
                      </Text>
                    </Box>
                  </Flex>
                  <Flex justify='space-between' align='center'>
                    <Text fontSize='sm' color='gray.400'>
                      Estado:
                    </Text>
                    <Button
                      size='sm'
                      colorScheme={method.enabled ? "green" : "red"}
                      variant='solid'>
                      {method.enabled ? "Habilitado" : "Deshabilitado"}
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </Grid>
          <Flex mt='24px'>
            <Button
              variant='dark'
              fontSize='sm'
              fontWeight='bold'
              w='200px'
              h='45px'>
              AGREGAR MÉTODO
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default PaymentMethods;
