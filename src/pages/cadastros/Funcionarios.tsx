import CadastroPage from '../../components/CadastroPage';
import { cadastroSchemas } from '../../lib/cadastroSchemas';

export default function Funcionarios() {
  return <CadastroPage schema={cadastroSchemas.funcionarios} />;
}
