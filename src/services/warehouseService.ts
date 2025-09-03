import axios from '@/lib/axios';

export const warehouseService = {
  async getWarehouses() {
    const response = await axios.get('/sitios');
    return response.data;
  },

  async getStockByWarehouse(sitioId: string) {
    const response = await axios.get(`/materiales?sitioId=${sitioId}`);
    return response.data;
  },

  async transferStock(data: { fromSitioId: string; toSitioId: string; materialId: number; cantidad: number }) {
    const response = await axios.post('/movimientos/transfer', data);
    return response.data;
  },

  async getLowStockByWarehouse(sitioId: string, threshold = 10) {
    const stock = await this.getStockByWarehouse(sitioId);
    return stock.filter((item: { stock: number }) => item.stock < threshold);
  },
};