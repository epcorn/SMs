import InputField from "@/components/form/InputField"
import ModalButton from "@/components/oth/ModalButton"
import { useForm } from "react-hook-form"


function Advance() {
  return (
    <div>
      <ModalButton title={'Create Advance'} btn="btn-secondary text-white">
        {/* <AdvanceForm /> */}
      </ModalButton>
    </div>
  )
}

export default Advance

function AdvanceForm() {
  const { register, formState: { errors }, handleSubmit } = useForm()
  const submit = async (data) => { console.log(data) }
  return (
    <form action="" onSubmit={handleSubmit(submit)}>
      <div className="min-w-2xl">
        <InputField error={errors} label={'Amount'} name={'amount'} register={register} />
      </div>
    </form>
  )
}