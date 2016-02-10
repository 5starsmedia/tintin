/*
 component:
 It is like a class.
 The base components are textInput, textArea, select, check, radio.
 User can custom the form with components.
 formObject:
 It is like an object (an instance of the component).
 User can custom the label, description, required and validation of the input.
 form:
 This is for end-user. There are form groups int the form.
 They can input the value to the form.
 */

export default function fbBuilderPvd() {
    this.components = {};
    this.groups = [];

    this.forms = {
        "default": []
    };
    this.convertComponent = (name, component) => {
        var result = {
            name: name,
            group: component.group || 'Default',
            label: component.label || '',
            defaults: component.defaults || {
                required: false,
                validation: '/.*/'
            },

            editable: component.editable || true,
            validationOptions: component.validationOptions || [],
            arrayToText: component.arrayToText || false,

            template: component.template,
            templateUrl: component.templateUrl,
            settingsTemplate: component.settingsTemplate,
            settingsTemplateUrl: component.settingsTemplateUrl
        };
        if (!result.template && !result.templateUrl) {
            console.error("The template is empty.");
        }
        if (!result.settingsTemplate && !result.settingsTemplateUrl) {
            console.error("The settingsTemplate is empty.");
        }
        return result;
    };
    this.convertFormObject = function (name, formObject) {
        if (formObject == null) {
            formObject = {};
        }
        var component = this.components[formObject.component];
        if (component == null) {
            throw "The component " + formObject.component + " was not registered.";
        }
        return {
            id: formObject.id,
            component: formObject.component,
            editable: formObject.editable || component.editable,
            index: formObject.index || 0,
            label: formObject.label || component.label,
            description: formObject.description || component.description,
            placeholder: formObject.placeholder || component.placeholder,
            options: formObject.options || component.options,
            required: formObject.required || component.required,
            validation: formObject.validation || component.validation
        };
    };
    this.reindexFormObject = function (name) {
        var formObjects = this.forms[name];
        for (var i = 0, len = formObjects.length; i < len; i++) {
            formObjects[i].index = i;
        }
    };

    this.registerComponent = function (name, component) {
        component = component || {};

        /*
         Register the component for form-builder.
         @param name: The component name.
         @param component: The component object.
         group: {string} The component group.
         label: {string} The label of the input.
         description: {string} The description of the input.
         placeholder: {string} The placeholder of the input.
         editable: {bool} Is the form object editable?
         required: {bool} Is the form object required?
         validation: {string} angular-validator. "/regex/" or "[rule1, rule2]". (default is RegExp(.*))
         validationOptions: {array} [{rule: angular-validator, label: 'option label'}] the options for the validation. (default is [])
         options: {array} The input options.
         arrayToText: {bool} checkbox could use this to convert input (default is no)
         template: {string} html template
         templateUrl: {string} The url of the template.
         popoverTemplate: {string} html template
         popoverTemplateUrl: {string} The url of the popover template.
         */
        if (this.components[name] == null) {
            var newComponent = this.convertComponent(name, component);
            this.components[name] = newComponent;

            if (this.groups.indexOf(newComponent.group) < 0) {
                this.groups.push(newComponent.group);
            }
        } else {
            console.error("The component " + name + " was registered.");
        }
    };

    this.addFormObject = (name, formObject) => {
        formObject = formObject || {};

        /*
         Insert the form object into the form at last.
         */
        this.forms[name] = this.forms[name] || [];
        return this.insertFormObject(name, this.forms[name].length, formObject);
    };

    this.insertFormObject = (name, index, formObject) => {
        formObject = formObject || {};

        /*
         Insert the form object into the form at {index}.
         @param name: The form name.
         @param index: The form object index.
         @param form: The form object.
         id: The form object id.
         component: {string} The component name
         editable: {bool} Is the form object editable? (default is yes)
         label: {string} The form object label.
         description: {string} The form object description.
         placeholder: {string} The form object placeholder.
         options: {array} The form object options.
         required: {bool} Is the form object required? (default is no)
         validation: {string} angular-validator. "/regex/" or "[rule1, rule2]".
         [index]: {int} The form object index. It will be updated by $builder.
         @return: The form object.
         */
        this.forms[name] = this.forms[name] || [];

        if (index > this.forms[name].length) {
            index = this.forms[name].length;
        } else if (index < 0) {
            index = 0;
        }
        this.forms[name].splice(index, 0, this.convertFormObject(name, formObject));
        this.reindexFormObject(name);
        return this.forms[name][index];
    };
    this.removeFormObject = (name, index) => {
        /*
         Remove the form object by the index.
         @param name: The form name.
         @param index: The form object index.
         */
        var formObjects = this.forms[name];
        formObjects.splice(index, 1);
        this.reindexFormObject(name);
    };

    this.updateFormObjectIndex = (name, oldIndex, newIndex) => {
        /*
         Update the index of the form object.
         @param name: The form name.
         @param oldIndex: The old index.
         @param newIndex: The new index.
         */
        var formObject, formObjects;
        if (oldIndex === newIndex) {
            return;
        }
        formObjects = this.forms[name];
        formObject = formObjects.splice(oldIndex, 1)[0];
        formObjects.splice(newIndex, 0, formObject);
        this.reindexFormObject(name);
    };

    var self = this;
    this.$get = /*@ngInject*/ () => {
        return self;
    };
};