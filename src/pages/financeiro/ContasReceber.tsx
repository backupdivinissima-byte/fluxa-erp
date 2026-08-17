import FinanceiroPage from '../../components/FinanceiroPage';

export default function ContasReceber() {
  return (
    <FinanceiroPage
      tipo="contasReceber"
      titulo="Contas a receber"
      tituloSingular="lançamento"
      descricao="Vendas e recebimentos da empresa, vinculados aos seus clientes."
      vinculo="cliente"
      verboQuitado="recebido"
    />
  );
}
