import React from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Text,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function RegisterProduct() {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Producto
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Nombre del Producto
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Nombre del producto'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Código/SKU
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Código único del producto'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Precio de Venta
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='number'
                  placeholder='0.00'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Precio de Compra
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='number'
                  placeholder='0.00'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Stock Inicial
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='number'
                  placeholder='Cantidad inicial'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Categoría
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Categoría del producto'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Descripción
              </FormLabel>
              <Textarea
                borderRadius='15px'
                fontSize='sm'
                placeholder='Descripción detallada del producto'
                rows={4}
              />
            </FormControl>
            <Button
              variant='dark'
              fontSize='sm'
              fontWeight='bold'
              w='200px'
              h='45px'
              mb='24px'>
              REGISTRAR PRODUCTO
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default RegisterProduct;
