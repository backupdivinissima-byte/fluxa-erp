import CadastroPage from '../../components/CadastroPage';
import { cadastroSchemas } from '../../lib/cadastroSchemas';

export default function Cargos() {
  return <CadastroPage schema={cadastroSchemas.cargos} />;
}
