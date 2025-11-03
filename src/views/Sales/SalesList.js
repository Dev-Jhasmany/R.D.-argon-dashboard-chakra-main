import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Text,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  IconButton,
  Tooltip,
  Input,
  Icon,
  ButtonGroup,
} from '@chakra-ui/react';
import { ViewIcon, DeleteIcon } from '@chakra-ui/icons';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import Card from 'components/Card/Card';
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import salesService from 'services/salesService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function SalesList() {
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputTextColor = useColorModeValue('gray.800', 'white');
  const infoBg = useColorModeValue('gray.50', 'gray.700');
  const totalsBg = useColorModeValue('blue.50', 'blue.900');
  const toast = useToast();

  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    const result = await salesService.getAllSales();
    if (result.success) {
      setSales(result.data);
      setFilteredSales(result.data);
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === '') {
      setFilteredSales(sales);
      return;
    }

    const filtered = sales.filter(
      (sale) =>
        sale.sale_number.toLowerCase().includes(value.toLowerCase()) ||
        sale.customer_name?.toLowerCase().includes(value.toLowerCase()) ||
        sale.customer_nit?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSales(filtered);
  };

  const openDetailModal = (sale) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSale(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta venta?')) {
      return;
    }

    const result = await salesService.deleteSale(id);
    if (result.success) {
      toast({
        title: 'Venta eliminada',
        description: 'La venta ha sido eliminada exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      loadSales();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentMethodBadge = (method) => {
    const colors = {
      efectivo: 'green',
      tarjeta: 'blue',
      transferencia: 'purple',
      qr: 'orange',
    };
    return (
      <Badge colorScheme={colors[method] || 'gray'}>
        {method.toUpperCase()}
      </Badge>
    );
  };

  // Exportar a PDF
  const exportToPDF = () => {
    const doc = new jsPDF('landscape'); // Modo horizontal para más columnas

    // Título
    doc.setFontSize(18);
    doc.text('Listado de Ventas con Stock', 14, 20);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-BO')}`, 14, 28);

    // Calcular totales
    const totalVentas = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);

    // Información de resumen
    doc.text(`Total de ventas: ${filteredSales.length}`, 14, 34);
    doc.text(`Monto total: Bs. ${totalVentas.toFixed(2)}`, 14, 40);

    let currentY = 46;

    // Iterar sobre cada venta para mostrar detalles con stock
    filteredSales.forEach((sale, index) => {
      // Verificar si necesitamos una nueva página
      if (currentY > 180) {
        doc.addPage('landscape');
        currentY = 20;
      }

      // Encabezado de venta
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${sale.sale_number} - ${sale.customer_name || 'Sin nombre'}`, 14, currentY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Fecha: ${formatDate(sale.created_at)} | Total: Bs. ${parseFloat(sale.total).toFixed(2)}`, 14, currentY + 5);

      currentY += 10;

      // Tabla de productos con stock
      if (sale.details && sale.details.length > 0) {
        const productsData = sale.details.map(detail => [
          detail.custom_code || detail.product?.code || '-',
          detail.custom_name || detail.product?.name || 'Producto',
          parseFloat(detail.quantity).toFixed(2),
          `Bs. ${parseFloat(detail.unit_price).toFixed(2)}`,
          `Bs. ${parseFloat(detail.subtotal).toFixed(2)}`,
          detail.product ? `${parseFloat(detail.product.stock).toFixed(2)} ${detail.product.unit}` : 'N/A',
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Código', 'Producto', 'Cantidad', 'Precio Unit.', 'Subtotal', 'Stock Actual']],
          body: productsData,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 1.5 },
          headStyles: { fillColor: [66, 153, 225], textColor: 255, fontSize: 8 },
          margin: { left: 14 },
        });

        currentY = doc.lastAutoTable.finalY + 8;
      }
    });

    // Guardar PDF
    doc.save(`ventas_con_stock_${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: 'PDF Generado',
      description: 'El listado de ventas con stock ha sido exportado a PDF',
      status: 'success',
      duration: 3000,
      isClosable: true,
        position: "top-right",
    });
  };

  // Exportar a Excel
  const exportToExcel = () => {
    // Preparar datos de resumen
    const totalVentas = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);

    // Preparar datos detallados con productos y stock
    const excelData = [];

    filteredSales.forEach(sale => {
      // Agregar encabezado de venta
      excelData.push({
        'Nº Venta': sale.sale_number,
        'Fecha': formatDate(sale.created_at),
        'Cliente': sale.customer_name || 'Sin nombre',
        'NIT/CI': sale.customer_nit || '-',
        'Método de Pago': sale.payment_method.toUpperCase(),
        'Total Venta': `Bs. ${parseFloat(sale.total).toFixed(2)}`,
        'Código Producto': '',
        'Producto': '',
        'Cantidad': '',
        'Precio Unit.': '',
        'Subtotal Línea': '',
        'Stock Actual': '',
      });

      // Agregar detalles de productos
      if (sale.details && sale.details.length > 0) {
        sale.details.forEach(detail => {
          excelData.push({
            'Nº Venta': '',
            'Fecha': '',
            'Cliente': '',
            'NIT/CI': '',
            'Método de Pago': '',
            'Total Venta': '',
            'Código Producto': detail.custom_code || detail.product?.code || '-',
            'Producto': detail.custom_name || detail.product?.name || 'Producto',
            'Cantidad': parseFloat(detail.quantity).toFixed(2),
            'Precio Unit.': `Bs. ${parseFloat(detail.unit_price).toFixed(2)}`,
            'Subtotal Línea': `Bs. ${parseFloat(detail.subtotal).toFixed(2)}`,
            'Stock Actual': detail.product ? `${parseFloat(detail.product.stock).toFixed(2)} ${detail.product.unit}` : 'N/A',
          });
        });
      }

      // Agregar fila en blanco como separador
      excelData.push({
        'Nº Venta': '',
        'Fecha': '',
        'Cliente': '',
        'NIT/CI': '',
        'Método de Pago': '',
        'Total Venta': '',
        'Código Producto': '',
        'Producto': '',
        'Cantidad': '',
        'Precio Unit.': '',
        'Subtotal Línea': '',
        'Stock Actual': '',
      });
    });

    // Agregar fila de total general
    excelData.push({
      'Nº Venta': '',
      'Fecha': '',
      'Cliente': '',
      'NIT/CI': '',
      'Método de Pago': 'TOTAL GENERAL:',
      'Total Venta': `Bs. ${totalVentas.toFixed(2)}`,
      'Código Producto': '',
      'Producto': '',
      'Cantidad': '',
      'Precio Unit.': '',
      'Subtotal Línea': '',
      'Stock Actual': '',
    });

    // Crear libro de trabajo
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas con Stock');

    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 18 }, // Nº Venta
      { wch: 20 }, // Fecha
      { wch: 25 }, // Cliente
      { wch: 15 }, // NIT/CI
      { wch: 15 }, // Método Pago
      { wch: 15 }, // Total Venta
      { wch: 15 }, // Código Producto
      { wch: 30 }, // Producto
      { wch: 12 }, // Cantidad
      { wch: 12 }, // Precio Unit.
      { wch: 15 }, // Subtotal Línea
      { wch: 15 }, // Stock Actual
    ];
    ws['!cols'] = colWidths;

    // Generar archivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `ventas_con_stock_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: 'Excel Generado',
      description: 'El listado de ventas con stock ha sido exportado a Excel',
      status: 'success',
      duration: 3000,
      isClosable: true,
        position: "top-right",
    });
  };

  return (
    <Flex direction='column' pt={{ base: '120px', md: '75px' }}>
      <Card overflowX={{ sm: 'scroll', xl: 'hidden' }}>
        <CardHeader p='12px 5px'>
          <Flex justify='space-between' align='center' wrap='wrap' gap={4}>
            <Text fontSize='xl' color={textColor} fontWeight='bold'>
              Listado de Ventas
            </Text>
            <Flex gap={3} align='center' flexWrap='wrap'>
              <Box minW={{ base: '100%', md: '300px' }}>
                <Input
                  placeholder='Buscar por número, cliente o NIT...'
                  value={searchTerm}
                  onChange={handleSearchChange}
                  size='md'
                  bg={inputBg}
                  color={inputTextColor}
                />
              </Box>
              <ButtonGroup size='sm' isAttached variant='outline'>
                <Button
                  leftIcon={<Icon as={FaFilePdf} />}
                  colorScheme='red'
                  onClick={exportToPDF}
                  isDisabled={filteredSales.length === 0}
                >
                  PDF
                </Button>
                <Button
                  leftIcon={<Icon as={FaFileExcel} />}
                  colorScheme='green'
                  onClick={exportToExcel}
                  isDisabled={filteredSales.length === 0}
                >
                  Excel
                </Button>
              </ButtonGroup>
              <Badge colorScheme='blue' p='6px 12px' borderRadius='8px'>
                {filteredSales.length} ventas
              </Badge>
            </Flex>
          </Flex>
        </CardHeader>
        <CardBody>
          {sales.length === 0 ? (
            <Box p={4} bg='blue.50' borderRadius='md'>
              <Text color='blue.800'>
                No hay ventas registradas aún.
              </Text>
            </Box>
          ) : filteredSales.length === 0 ? (
            <Box p={4} bg='blue.50' borderRadius='md'>
              <Text color='blue.800'>
                No se encontraron ventas con el término "{searchTerm}"
              </Text>
            </Box>
          ) : (
            <Table variant='simple' color={textColor}>
              <Thead>
                <Tr>
                  <Th borderColor={borderColor} color='gray.400'>
                    Nº Venta
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Fecha
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Cliente
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    NIT/CI
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Total
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Método Pago
                  </Th>
                  <Th borderColor={borderColor} color='gray.400'>
                    Acciones
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredSales.map((sale) => (
                  <Tr key={sale.id}>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold'>
                        {sale.sale_number}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{formatDate(sale.created_at)}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{sale.customer_name || 'Sin nombre'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm'>{sale.customer_nit || '-'}</Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      <Text fontSize='sm' fontWeight='bold' color='green.500'>
                        Bs. {parseFloat(sale.total).toFixed(2)}
                      </Text>
                    </Td>
                    <Td borderColor={borderColor}>
                      {getPaymentMethodBadge(sale.payment_method)}
                    </Td>
                    <Td borderColor={borderColor}>
                      <Flex gap={2}>
                        <Tooltip label='Ver Detalles'>
                          <IconButton
                            icon={<ViewIcon />}
                            colorScheme='blue'
                            variant='outline'
                            size='sm'
                            onClick={() => openDetailModal(sale)}
                          />
                        </Tooltip>
                        <Tooltip label='Eliminar'>
                          <IconButton
                            icon={<DeleteIcon />}
                            colorScheme='red'
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(sale.id)}
                          />
                        </Tooltip>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Modal de detalles */}
      <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} size='4xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Detalles de Venta {selectedSale?.sale_number}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSale && (
              <Flex direction='column' gap='20px'>
                {/* Información general */}
                <Box p={4} bg={infoBg} borderRadius='md'>
                  <Flex direction='column' gap={2}>
                    <Flex justify='space-between'>
                      <Text fontSize='sm' fontWeight='bold' color={textColor}>
                        Fecha:
                      </Text>
                      <Text fontSize='sm' color={textColor}>{formatDate(selectedSale.created_at)}</Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text fontSize='sm' fontWeight='bold' color={textColor}>
                        Cliente:
                      </Text>
                      <Text fontSize='sm' color={textColor}>
                        {selectedSale.customer_name || 'Sin nombre'}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text fontSize='sm' fontWeight='bold' color={textColor}>
                        NIT/CI:
                      </Text>
                      <Text fontSize='sm' color={textColor}>{selectedSale.customer_nit || '-'}</Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text fontSize='sm' fontWeight='bold' color={textColor}>
                        Método de Pago:
                      </Text>
                      {getPaymentMethodBadge(selectedSale.payment_method)}
                    </Flex>
                    {selectedSale.notes && (
                      <Flex justify='space-between'>
                        <Text fontSize='sm' fontWeight='bold' color={textColor}>
                          Notas:
                        </Text>
                        <Text fontSize='sm' color={textColor}>{selectedSale.notes}</Text>
                      </Flex>
                    )}
                  </Flex>
                </Box>

                {/* Productos */}
                <Box>
                  <Text fontSize='md' fontWeight='bold' mb={3} color={textColor}>
                    Productos Vendidos
                  </Text>
                  <Table size='sm' variant='simple'>
                    <Thead>
                      <Tr>
                        <Th>Código</Th>
                        <Th>Producto</Th>
                        <Th>Cantidad</Th>
                        <Th>Precio Unit.</Th>
                        <Th>Subtotal</Th>
                        <Th>Stock Actual</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedSale.details.map((detail) => (
                        <Tr key={detail.id}>
                          <Td>{detail.custom_code || detail.product?.code}</Td>
                          <Td>{detail.custom_name || detail.product?.name}</Td>
                          <Td>{parseFloat(detail.quantity).toFixed(2)}</Td>
                          <Td>Bs. {parseFloat(detail.unit_price).toFixed(2)}</Td>
                          <Td>Bs. {parseFloat(detail.subtotal).toFixed(2)}</Td>
                          <Td>
                            {detail.product ? (
                              <Badge
                                colorScheme={
                                  parseFloat(detail.product.stock) === 0
                                    ? 'red'
                                    : parseFloat(detail.product.stock) <= 5
                                    ? 'orange'
                                    : parseFloat(detail.product.stock) <= 10
                                    ? 'yellow'
                                    : 'green'
                                }
                              >
                                {parseFloat(detail.product.stock).toFixed(2)} {detail.product.unit}
                              </Badge>
                            ) : (
                              <Text fontSize='xs' color='gray.500'>
                                N/A
                              </Text>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                {/* Totales */}
                <Box p={4} bg={totalsBg} borderRadius='md'>
                  <Flex direction='column' gap={2}>
                    <Flex justify='space-between'>
                      <Text fontSize='sm' color={textColor}>Subtotal:</Text>
                      <Text fontSize='sm' fontWeight='bold' color={textColor}>
                        Bs. {parseFloat(selectedSale.subtotal).toFixed(2)}
                      </Text>
                    </Flex>
                    <Flex justify='space-between'>
                      <Text fontSize='sm' color={textColor}>Descuento:</Text>
                      <Text fontSize='sm' fontWeight='bold' color={textColor}>
                        Bs. {parseFloat(selectedSale.discount).toFixed(2)}
                      </Text>
                    </Flex>
                    <Box borderTop='1px' borderColor={borderColor} pt={2}>
                      <Flex justify='space-between'>
                        <Text fontSize='lg' fontWeight='bold' color={textColor}>
                          Total:
                        </Text>
                        <Text fontSize='xl' fontWeight='bold' color='green.400'>
                          Bs. {parseFloat(selectedSale.total).toFixed(2)}
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={closeDetailModal}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default SalesList;
