/**
 * COMPONENTE: TicketReceipt
 *
 * Componente para visualizar e imprimir tickets de venta en formato térmico.
 * Basado en el diseño de tickets de CHICKEN SALSA EXPRESS.
 *
 * CARACTERÍSTICAS:
 * - Diseño optimizado para impresoras térmicas (58mm/80mm)
 * - Modal con vista previa del ticket
 * - Botón de impresión con función window.print()
 * - Información del negocio configurable
 * - Detalles de productos y totales
 * - Fecha, hora y número de pedido
 *
 * PROPS:
 * - isOpen: boolean - Control del modal
 * - onClose: function - Callback para cerrar el modal
 * - saleData: object - Datos de la venta {
 *     sale_number: string,
 *     created_at: string,
 *     customer_name: string,
 *     total: number,
 *     discount: number,
 *     payment_method: string,
 *     notes: string,
 *     details: array [{product_name, quantity, unit_price, subtotal}]
 *   }
 * - businessInfo: object - Información del negocio {
 *     name: string,
 *     branch: string,
 *     address: string,
 *     phone: string,
 *     website: string
 *   }
 */

import React, { useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Divider,
  Flex,
  VStack,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';

function TicketReceipt({ isOpen, onClose, saleData, businessInfo }) {
  const ticketRef = useRef();

  // Configuración por defecto del negocio (si no se proporciona businessInfo)
  const defaultBusinessInfo = {
    name: 'CHICKEN SALSA EXPRESS',
    branch: 'Sucursal UAGRM',
    address: 'UAGRM, Santa Cruz Bolivia',
    phone: '781-33-543',
    website: 'www.boliviansoftware.com',
  };

  const business = businessInfo || defaultBusinessInfo;

  /**
   * Función para imprimir el ticket
   * Abre el diálogo de impresión del navegador con estilos optimizados para impresora térmica
   */
  const handlePrint = () => {
    const printContent = ticketRef.current;
    const windowPrint = window.open('', '', 'width=300,height=600');

    windowPrint.document.write(`
      <html>
        <head>
          <title>Ticket - ${saleData.sale_number}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }

            @media print {
              body {
                margin: 0;
                padding: 0;
              }

              .no-print {
                display: none;
              }
            }

            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 12px;
              line-height: 1.4;
              padding: 10px;
              max-width: 80mm;
              margin: 0 auto;
            }

            .ticket-container {
              width: 100%;
            }

            .center {
              text-align: center;
            }

            .bold {
              font-weight: bold;
            }

            .large {
              font-size: 16px;
            }

            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }

            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              font-weight: bold;
              margin: 4px 0;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    windowPrint.document.close();
    windowPrint.focus();

    // Esperar un momento antes de imprimir para asegurar que el contenido se cargó
    setTimeout(() => {
      windowPrint.print();
      windowPrint.close();
    }, 250);
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  // Validar que existan datos de venta antes de procesarlos
  if (!saleData) {
    return null;
  }

  // Calcular subtotal (total antes de descuento)
  const calculateSubtotal = () => {
    if (saleData.details && saleData.details.length > 0) {
      return saleData.details.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);
    }
    // Si no hay detalles, el subtotal es el total + descuento
    return parseFloat(saleData.total) + parseFloat(saleData.discount || 0);
  };

  const subtotal = calculateSubtotal();
  const discount = parseFloat(saleData.discount || 0);
  const total = parseFloat(saleData.total);

  // Calcular recibido y cambio (por ahora 0, se puede expandir)
  const received = 0;
  const change = 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Ticket de Venta</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          {/* Contenedor del ticket con ref para imprimir */}
          <Box
            ref={ticketRef}
            bg="white"
            color="black"
            p={4}
            fontFamily="'Courier New', Courier, monospace"
            fontSize="sm"
            maxW="300px"
            mx="auto"
            border="1px solid"
            borderColor="gray.300"
            borderRadius="md"
          >
            {/* Encabezado del negocio */}
            <VStack spacing={1} mb={3}>
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                {business.name}
              </Text>
              <Text fontSize="sm" textAlign="center">
                {business.branch}
              </Text>
              <Text fontSize="xs" textAlign="center">
                {business.address}
              </Text>
              <Text fontSize="xs" textAlign="center">
                Whatsapp {business.phone}
              </Text>
            </VStack>

            {/* Tipo de servicio */}
            <Box my={2}>
              <Text textAlign="center" fontWeight="bold">
                PARA MESA
              </Text>
            </Box>

            <Divider borderColor="gray.400" borderStyle="solid" my={2} />

            {/* Fecha, hora y número de pedido */}
            <Flex justify="space-between" fontSize="xs" mb={2}>
              <Text>{formatDateTime(saleData.created_at)}</Text>
              <Text fontWeight="bold">PEDIDO: {saleData.sale_number}</Text>
            </Flex>

            {/* Encabezado de tabla */}
            <Box fontSize="xs" mb={2}>
              <Flex justify="space-between" fontWeight="bold">
                <Text flex="1">Cant</Text>
                <Text flex="3">Producto</Text>
                <Text flex="1" textAlign="right">Sub Total</Text>
              </Flex>
            </Box>

            <Divider borderColor="gray.400" borderStyle="dashed" my={1} />

            {/* Detalles de productos */}
            <VStack spacing={1} align="stretch" fontSize="xs" mb={2}>
              {saleData.details && saleData.details.length > 0 ? (
                saleData.details.map((item, index) => {
                  const itemName = item.custom_name || item.product_name || 'Producto';
                  const itemSubtotal = item.quantity * item.unit_price;

                  return (
                    <Flex key={index} justify="space-between">
                      <Text flex="1">{item.quantity}</Text>
                      <Text flex="3" noOfLines={2}>{itemName}</Text>
                      <Text flex="1" textAlign="right">{itemSubtotal.toFixed(0)}</Text>
                    </Flex>
                  );
                })
              ) : (
                <Text textAlign="center" color="gray.500">Sin detalles</Text>
              )}
            </VStack>

            <Divider borderColor="gray.400" borderStyle="dashed" my={1} />

            {/* Totales */}
            <VStack spacing={1} align="stretch" fontSize="sm" mt={2}>
              {discount > 0 && (
                <>
                  <Flex justify="space-between">
                    <Text>SUBTOTAL</Text>
                    <Text>{subtotal.toFixed(0)} bs</Text>
                  </Flex>
                  <Flex justify="space-between" color="red.600">
                    <Text>DESCUENTO</Text>
                    <Text>-{discount.toFixed(0)} bs</Text>
                  </Flex>
                </>
              )}

              <Flex justify="space-between" fontWeight="bold" fontSize="md">
                <Text>TOTAL</Text>
                <Text>{total.toFixed(0)} bs</Text>
              </Flex>

              <Flex justify="space-between">
                <Text>RECIBIDO</Text>
                <Text>{received.toFixed(0)} bs</Text>
              </Flex>

              <Flex justify="space-between">
                <Text>CAMBIO</Text>
                <Text>{change.toFixed(0)} bs</Text>
              </Flex>
            </VStack>

            {/* Notas */}
            {saleData.notes && (
              <>
                <Divider borderColor="gray.400" borderStyle="solid" my={2} />
                <Box fontSize="xs">
                  <Text fontWeight="bold">Nota: {saleData.notes}</Text>
                </Box>
              </>
            )}

            {/* Pie del ticket */}
            <Divider borderColor="gray.400" borderStyle="solid" my={2} />
            <Text fontSize="xs" textAlign="center">
              {business.website}
            </Text>
          </Box>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="blue"
            onClick={handlePrint}
          >
            Imprimir Ticket
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default TicketReceipt;
