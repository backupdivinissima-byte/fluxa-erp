import CadastroPage from '../../components/CadastroPage';
import { cadastroSchemas } from '../../lib/cadastroSchemas';

export default function Clientes() {
  return <CadastroPage schema={cadastroSchemas.clientes} />;
}
