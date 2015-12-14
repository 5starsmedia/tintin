CKEDITOR.on('dialogDefinition', function(ev) {
    if (ev.data.name == "link") {
        var dialogDefinition = ev.data.definition;
        var info = dialogDefinition.getContents('info');
        info.elements.push({
            type: "vbox",
            id: "urlOptions",
            children: [{
                type: "hbox",
                children: [{
                    id: "button",
                    type: "checkbox",
                    label: "No follow",
                    commit: function(data) {
                        data.button = this.getValue();
                        data.advanced = data.advanced || {};
                        if (data.button) {
                            data.advanced.advRel = 'nofollow';
                        } else {
                            data.advanced.advRel = '';
                        }
                        console.log("commit", data.button, data);
                    },
                    setup: function(data) {
                        this.setValue(data.advanced && data.advanced.advRel == 'nofollow');
                        console.log("setup", data.button, data);
                    }
                }]
            }]
        });
    }
});