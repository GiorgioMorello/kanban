import Swal from "sweetalert2";


export default function Alert(){

    function send_alert(title, icon){
        Swal.fire({
                    title: title,
                    icon: icon,
                    toast: true,
                    timer: 4000,
                    position: "top-right",
                    timerProgressBar: true,
                    showConfirmButton: false,
                    grow: false,
                    heightAuto: false,
                    customClass: {
                        popup: 'small_toast'
                    }
                })
    }


    return send_alert

}
