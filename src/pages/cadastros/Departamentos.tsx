import CadastroPage from '../../components/CadastroPage';
import { cadastroSchemas } from '../../lib/cadastroSchemas';

export default function Departamentos() {
  return <CadastroPage schema={cadastroSchemas.departamentos} />;
}
