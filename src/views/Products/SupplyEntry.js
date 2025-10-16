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

function SupplyEntry() {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Entrada de Insumos
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Producto/Insumo
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Seleccione el producto'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Cantidad
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='number'
                  placeholder='Cantidad a ingresar'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Proveedor
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Seleccione proveedor'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Fecha de Entrada
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='date'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Observaciones
              </FormLabel>
              <Textarea
                borderRadius='15px'
                fontSize='sm'
                placeholder='Notas adicionales sobre la entrada'
                rows={3}
              />
            </FormControl>
            <Button
              variant='dark'
              fontSize='sm'
              fontWeight='bold'
              w='200px'
              h='45px'
              mb='24px'>
              REGISTRAR ENTRADA
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default SupplyEntry;
