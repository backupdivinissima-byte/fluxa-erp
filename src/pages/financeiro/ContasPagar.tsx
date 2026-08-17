import FinanceiroPage from '../../components/FinanceiroPage';

export default function ContasPagar() {
  return (
    <FinanceiroPage
      tipo="contasPagar"
      titulo="Contas a pagar"
      tituloSingular="lançamento"
      descricao="Despesas e compras da empresa, vinculadas aos seus fornecedores."
      vinculo="fornecedor"
      verboQuitado="pago"
    />
  );
}
