import { Row, Col } from 'antd';
import React, { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { MdOutlineLocalShipping } from "react-icons/md";
import countryList from 'react-select-country-list'
import countryRegionData from 'country-region-data/dist/data-umd';
import states from '../data/sales-tax.json'

const DeliveryForm = ({ setActiveStep, setCompletedSteps, checkedValue, setCheckedValue, formData, setFormData, sweetAlert }) => {
    const [selectedCountry, setSelectedCountry] = useState(formData.country)
    const [regionData, setRegionData] = useState([])
    const countries = countryList().getData()
    // const countries = allCountries
    const handleSubmit = (e) => {
        e.preventDefault()
        const { firstName, lastName, phone, country, address, city, state, zipCode } = formData
        if (!firstName || !lastName || !phone || !country || !address || !city || !state || !zipCode) {
            sweetAlert('error', 'Please fill all the required fields')
        } else {
            setActiveStep(2)
            setCompletedSteps(prevCompletedSteps => [...prevCompletedSteps, 1]);
        }
    }
    const handleCountrySelect = (e) => {
        const value = e.target.value
        setSelectedCountry(value)
    }
    const handleFormData = (e) => {
        const name = e.target.name
        const value = e.target.value
        setFormData({ ...formData, [name]: value })
    }
    useEffect(() => {
        console.log('selectedCountry', selectedCountry)
        setFormData({ ...formData, country: selectedCountry })
        countryRegionData.forEach(country => {
            if (country.countryShortCode == selectedCountry) {
                console.log('region:',country.regions)
                setRegionData(country.regions)
            }
        });
    }, [selectedCountry])
    return (
        <>
            <div className="step-content delivery-step">
                <p className="info-form">Select how you would like your order delivered.</p>

                <form onSubmit={handleSubmit}>
                    <Row gutter={[{ lg: 30 }, { lg: 20 }]}>
                        <Col lg={12} sm={24}>
                            <div className="input-field">
                                <label>First Name</label>
                                <input name='firstName' onChange={handleFormData} value={formData.firstName} type="text" />
                            </div>
                        </Col>
                        <Col lg={12} sm={24}>
                            <div className="input-field">
                                <label>Last Name</label>
                                <input name='lastName' onChange={handleFormData} value={formData.lastName} type="text" />
                            </div>
                        </Col>
                        <Col lg={12} sm={24}>
                            <div className="input-field">
                                <label>Phone</label>
                                <input name='phone' onChange={handleFormData} value={formData.phone} type="text" />
                            </div>
                        </Col>
                        <Col lg={12} sm={24}>
                            <div className="input-field">
                                <label>Company <span className="opt">(Optional)</span></label>
                                <input name='company' onChange={handleFormData} value={formData.company} type="text" />
                            </div>
                        </Col>
                        <Col sm={24}>
                            <div className="input-field">
                                <label>Country </label>
                                <input name='country' type="text" readOnly value={formData.country} />
                                {/* <select name='country' onChange={handleCountrySelect}>
                                    <option value="">Select Country</option>
                                    {countries.map((country) => {
                                        if (formData.country == country.value) {
                                            return <option value={country.value} selected>{country.label}</option>
                                        }
                                        return <option value={country.value}>{country.label}</option>
                                    })}
                                </select> */}
                            </div>
                        </Col>
                        <Col sm={24}>
                            <div className="input-field">
                                <label>Address </label>
                                <input name='address' onChange={handleFormData} value={formData.address} type="text" />
                            </div>
                        </Col>
                        <Col sm={24}>
                            <div className="input-field">
                                <label>City </label>
                                <input name='city' onChange={handleFormData} value={formData.city} type="text" />
                            </div>
                        </Col>
                        <Col lg={16} sm={24}>
                            <div className="input-field">
                                <label>State </label>
                                <select name='state' onChange={handleFormData}>
                                    <option value="">Select State</option>
                                    {states.map((region) => <option selected={formData.state === region.State ? 'selected' : ''} value={region.State}>{region.State}</option>)}
                                </select>
                            </div>
                        </Col>
                        <Col lg={8} sm={24}>
                            <div className="input-field">
                                <label>Postal or ZIP Code</label>
                                <input name='zipCode' onChange={handleFormData} value={formData.zipCode} type="text" />
                            </div>
                        </Col>
                        <Col sm={24}>
                            <button type='submit' className='submit-btn'>Continue</button>
                        </Col>
                    </Row>
                </form>

            </div>
        </>
    )
}

export default DeliveryForm
