<?php

namespace App\Support;

class Validator
{
    private array $data;
    private array $rules;
    private array $errors = [];

    public function __construct(array $data, array $rules)
    {
        $this->data = $data;
        $this->rules = $rules;
    }

    public static function make(array $data, array $rules): self
    {
        $validator = new self($data, $rules);
        $validator->validate();
        return $validator;
    }

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function validated(): array
    {
        $validated = [];
        foreach (array_keys($this->rules) as $field) {
            if (array_key_exists($field, $this->data)) {
                $validated[$field] = $this->data[$field];
            }
        }
        return $validated;
    }

    private function validate(): void
    {
        foreach ($this->rules as $field => $ruleString) {
            $rulesList = is_array($ruleString) ? $ruleString : explode('|', $ruleString);
            $value = $this->data[$field] ?? null;

            foreach ($rulesList as $rule) {
                $params = [];
                if (str_contains($rule, ':')) {
                    [$ruleName, $paramStr] = explode(':', $rule, 2);
                    $params = explode(',', $paramStr);
                } else {
                    $ruleName = $rule;
                }

                $this->applyRule($field, $value, $ruleName, $params);
            }
        }
    }

    private function applyRule(string $field, mixed $value, string $rule, array $params): void
    {
        $readableField = ucfirst(str_replace('_', ' ', $field));

        switch ($rule) {
            case 'required':
                if ($value === null || $value === '' || (is_array($value) && empty($value))) {
                    $this->addError($field, "{$readableField} is required.");
                }
                break;

            case 'email':
                if ($value !== null && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, "{$readableField} must be a valid email address.");
                }
                break;

            case 'min':
                $min = (int)($params[0] ?? 0);
                if (is_string($value) && mb_strlen($value) < $min) {
                    $this->addError($field, "{$readableField} must be at least {$min} characters.");
                } elseif (is_numeric($value) && $value < $min) {
                    $this->addError($field, "{$readableField} must be at least {$min}.");
                } elseif (is_array($value) && count($value) < $min) {
                    $this->addError($field, "{$readableField} must have at least {$min} items.");
                }
                break;

            case 'max':
                $max = (int)($params[0] ?? 0);
                if (is_string($value) && mb_strlen($value) > $max) {
                    $this->addError($field, "{$readableField} may not be greater than {$max} characters.");
                } elseif (is_numeric($value) && $value > $max) {
                    $this->addError($field, "{$readableField} may not be greater than {$max}.");
                }
                break;

            case 'numeric':
                if ($value !== null && $value !== '' && !is_numeric($value)) {
                    $this->addError($field, "{$readableField} must be numeric.");
                }
                break;

            case 'integer':
                if ($value !== null && $value !== '' && !filter_var($value, FILTER_VALIDATE_INT)) {
                    $this->addError($field, "{$readableField} must be an integer.");
                }
                break;

            case 'in':
                if ($value !== null && $value !== '' && !in_array((string)$value, $params, true)) {
                    $allowed = implode(', ', $params);
                    $this->addError($field, "{$readableField} must be one of: {$allowed}.");
                }
                break;

            case 'array':
                if ($value !== null && !is_array($value)) {
                    $this->addError($field, "{$readableField} must be an array.");
                }
                break;

            case 'pincode':
                // 6-digit Indian pincode validation
                if ($value !== null && $value !== '' && !preg_match('/^[1-9][0-9]{5}$/', (string)$value)) {
                    $this->addError($field, "{$readableField} must be a valid 6-digit Indian PIN code.");
                }
                break;

            case 'phone':
                // 10-digit Indian mobile validation
                $cleanPhone = preg_replace('/[^0-9]/', '', (string)$value);
                if ($value !== null && $value !== '' && (strlen($cleanPhone) < 10 || strlen($cleanPhone) > 13)) {
                    $this->addError($field, "{$readableField} must be a valid phone number.");
                }
                break;
        }
    }

    private function addError(string $field, string $message): void
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }
}
