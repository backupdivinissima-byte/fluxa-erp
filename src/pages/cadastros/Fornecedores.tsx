import CadastroPage from '../../components/CadastroPage';
import { cadastroSchemas } from '../../lib/cadastroSchemas';

export default function Fornecedores() {
  return <CadastroPage schema={cadastroSchemas.fornecedores} />;
}
