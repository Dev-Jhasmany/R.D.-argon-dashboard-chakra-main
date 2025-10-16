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

function RegisterPromotion() {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Promoción
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Nombre de la Promoción
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Ej: Descuento de Verano'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Porcentaje de Descuento
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='number'
                  placeholder='0 - 100'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Fecha de Inicio
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='date'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Fecha de Fin
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
                Descripción
              </FormLabel>
              <Textarea
                borderRadius='15px'
                fontSize='sm'
                placeholder='Descripción de la promoción'
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
              REGISTRAR PROMOCIÓN
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default RegisterPromotion;
