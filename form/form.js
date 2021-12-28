function get_value(object, key, default_value) {
    var result = object[key];
    return (typeof result !== "undefined") ? result : default_value;
};

function titleCase(str) {
    var splitStr = str.toLowerCase().split(',');
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(",");
}

function get_notification_text(response) {
    let code = get_value(response.data, "code", "unknown");
    let detail = get_value(response.data, "detail", "Something went wrong.");

    if (code === "missing_required_fields") {
        let errors = response.data["errors"];
        let missing_required_fields = errors.map(({ field }) => field);
        if (errors && errors.length) {
            notification = "Missing required fields: " + titleCase(missing_required_fields.toString());
        }
    }
    else if (code === "invalid_email_fields") {
        let errors = response.data["errors"];
        let invalid_email_fields = errors.map(({ field }) => field);
        if (errors && errors.length) {
            notification = "Invalid email fields: " + titleCase(invalid_email_fields.toString());
        }
    }
    else {
        notification = detail;
    }

    return notification
};

$(document).on("submit", "form.main-form", function (e) {
    e.preventDefault();

    // get current form object
    var currentForm = $(this);

    // disable submit button
    $("[type=submit]", currentForm).attr("disabled", "disabled");

    // read form data
    let formData = $(this)
        .serializeArray()
        .map(
            function (x) {
                this[x.name] = x.value;
                return this;
            }.bind({})
        )[0];

    // send form data
    axios({
        method: $(this).attr("method"),
        url: $(this).attr("action"),
        data: formData
    })
        .then(function (response) {
            var hand = setTimeout(function () {
                // clear the form if form submitted successfully
                $(currentForm).trigger("reset");

                // show returned success message
                toastr.success(get_notification_text(response))

                // enable submit button again
                $("[type=submit]", currentForm).removeAttr("disabled");
                clearTimeout(hand);
            }, 1000);
        })
        .catch(function (error) {
            // show returned fail message
            toastr.error(get_notification_text(error.response))

            // enable submit button again
            $("[type=submit]", currentForm).removeAttr("disabled");
        });
});