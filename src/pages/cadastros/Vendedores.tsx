import CadastroPage from '../../components/CadastroPage';
import { cadastroSchemas } from '../../lib/cadastroSchemas';

export default function Vendedores() {
  return <CadastroPage schema={cadastroSchemas.vendedores} />;
}
