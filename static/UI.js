console.log("Read file Ui.js")

class Ui {
    constructor(net) {
        console.log("Constructor of class Ui")
        this.clicks()
        this.interval = null;
        this.net = net;
    }

    clicks() {
        let parent = this;
        //$("#toggle").hide();
        $("#login").on("click", function () {
            let value = $("#value").val();
            console.log("ADD_USER: " + value);
            parent.net.addPlayer(value, parent.info)
            // $("#overly").hide();
        })
        $("#reset").on("click", function () {
            parent.net.removePlayers(parent.info)
        })
        $('.message .close').on('click', function () {
            $('#message').css("transform", "scale(0)")
        });
        $("#dice").on("click", function () {
            parent.net.dice();
        })
        $("#dice").hide();
        $('#message .message .close').on('click', function () {
            $('#message').css("transform", "scale(0)")
        });
        $('#info .message .close').on('click', function () {
            $('#info').css("transform", "scale(0)")
        });
        $('#turnInfo').on('click', function () {
            $('#info').css("transform", "scale(1)")
        });
    }

    info(content) {
        let msg = $('#message').css("transform")
        let values = msg.split("(")[1];
        values = values.split(")")[0];
        values = values.split(",");

        let a = values[0];
        let b = values[1];

        let scale = Math.sqrt(a * a + b * b);
        console.log(scale) // .80
        
        if(scale==0)
        $("#message").css("transform", "scale(1)")

        $("#mess").html(content)
    }

    loading(show) {
        if (show) {
            $("#waiting").css("display","flex");
        }
        else {
            $("#waiting").css("display","none");
        }
    }


}