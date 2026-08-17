import CadastroPage from '../../components/CadastroPage';
import { cadastroSchemas } from '../../lib/cadastroSchemas';

export default function Produtos() {
  return <CadastroPage schema={cadastroSchemas.produtos} />;
}
