


export default function TaskUtils(){

    const current_date = new Date().toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'}).split('/').reverse().join('-');

    function validate_form(date, title, desc, set_errors, is_editing){
        let post_errors = [];

        if (title.length <= 1 || desc.length <= 1){
            post_errors.push('Os campos de textos devem devem ter mais que um caractere')
        }

        if (date < current_date){
            post_errors.push('Selecione uma data válida');

        } else {

        }

        //console.log(input_date, current_date)

        if(post_errors.length > 0) {
            set_errors(post_errors)
            return false
        }

        return true

    }


    return {validate_form, current_date}

}